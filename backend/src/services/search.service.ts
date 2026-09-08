import type { Marketplace, Offer, SearchResponse, SearchSource } from "../contracts/search.js";
import { searchKabum } from "./marketplaces/kabum.provider.js";
import { searchPatoloco } from "./marketplaces/patoloco.provider.js";
import { searchPichau } from "./marketplaces/pichau.provider.js";
import { searchTerabyte } from "./marketplaces/terabyte.provider.js";

const MAX_QUERY_LENGTH = 120;
const RESULTS_PER_MARKETPLACE = 5;
const EXPECTED_SOURCE_RESULTS = RESULTS_PER_MARKETPLACE;
const CACHE_MAX_ENTRIES = Number(process.env.KABUM_SEARCH_CACHE_MAX_ENTRIES ?? 100);
const CACHE_TTL_MS = Number(process.env.KABUM_SEARCH_CACHE_TTL_MS ?? 15 * 60 * 1000);

type CacheEntry = {
  expiresAt: number;
  response: SearchResponse;
};

const cache = new Map<string, CacheEntry>();
const inFlightSearches = new Map<string, Promise<SearchResponse>>();

export class SearchInputError extends Error {}

export class SearchSourceError extends Error {}

export function parseSearchRequest(body: unknown): { query: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new SearchInputError("Envie uma busca válida.");
  }

  const query = (body as { query?: unknown }).query;

  if (typeof query !== "string") {
    throw new SearchInputError("Informe o produto que deseja pesquisar.");
  }

  const normalizedQuery = query.trim().replace(/\s+/g, " ");

  if (!normalizedQuery || normalizedQuery.length > MAX_QUERY_LENGTH) {
    throw new SearchInputError(
      `A busca deve ter entre 1 e ${MAX_QUERY_LENGTH} caracteres.`,
    );
  }

  return { query: normalizedQuery };
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildSummary(query: string, offers: SearchResponse["offers"]): string {
  if (offers.length === 0) {
    return `Não encontrei ofertas nas lojas consultadas para "${query}" agora. Tente informar marca, modelo ou especificações do hardware.`;
  }

  const cheapest = offers[0];
  const countLabel = offers.length === 1 ? "oferta" : "ofertas";
  const priceLabel = cheapest.priceType === "cash"
    ? "menor preço à vista"
    : "menor preço anunciado";

  const marketplaceName = cheapest.marketplace === "kabum"
    ? "KaBuM"
    : cheapest.marketplace === "terabyte"
      ? "Terabyte"
      : cheapest.marketplace === "pichau"
        ? "Pichau"
        : "Patoloco";

  return `Encontrei **${offers.length} ${countLabel}** para "${query}". O ${priceLabel} é **${formatBRL(cheapest.price)}** na **${marketplaceName}** para **${cheapest.title}**.`;
}

function cleanExpiredEntries(now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

function cacheKey(query: string): string {
  return query.toLocaleLowerCase("pt-BR");
}

async function collectSearch(query: string): Promise<SearchResponse> {
  const providers: Array<{ marketplace: Marketplace; search: () => Promise<Offer[]> }> = [
    { marketplace: "kabum", search: () => searchKabum(query, RESULTS_PER_MARKETPLACE) },
    { marketplace: "terabyte", search: () => searchTerabyte(query, RESULTS_PER_MARKETPLACE) },
    { marketplace: "pichau", search: () => searchPichau(query, RESULTS_PER_MARKETPLACE) },
    { marketplace: "patoloco", search: () => searchPatoloco(query, RESULTS_PER_MARKETPLACE) },
  ];
  // A failure from one store must not discard offers collected from the other store.
  const results = await Promise.allSettled(providers.map((provider) => provider.search()));
  const sources: SearchSource[] = results.map((result, index) => {
    const marketplace = providers[index].marketplace;

    if (result.status === "fulfilled") {
      return { marketplace, status: "ok", resultCount: result.value.length };
    }

    const message = result.reason instanceof Error ? result.reason.message : "Falha desconhecida.";
    return { marketplace, status: "unavailable", resultCount: 0, message };
  });
  const offers = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);

  if (offers.length === 0 && sources.every((source) => source.status === "unavailable")) {
    throw new SearchSourceError(sources.map((source) => source.message).filter(Boolean).join(" "));
  }

  offers.sort((first, second) =>
    first.price - second.price || first.title.localeCompare(second.title, "pt-BR"),
  );

  return {
    query,
    searchedAt: new Date().toISOString(),
    // Preserve four offers from each marketplace, then expose the combined list by price.
    offers,
    sources,
    summary: buildSummary(query, offers),
  };
}

export async function searchOffers(query: string): Promise<SearchResponse> {
  const key = cacheKey(query);
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.response;
  }

  const pendingSearch = inFlightSearches.get(key);

  if (pendingSearch) {
    return pendingSearch;
  }

  const search = collectSearch(query)
    .then((response) => {
      cleanExpiredEntries(now);

      if (cache.size >= CACHE_MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value;

        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }

      // Incomplete searches must be retried instead of preserving a temporary store failure for 15 minutes.
      const isComplete = response.sources.every(
        (source) => source.status === "ok" && source.resultCount >= EXPECTED_SOURCE_RESULTS,
      );

      if (isComplete) {
        cache.set(key, {
          expiresAt: now + CACHE_TTL_MS,
          response,
        });
      }

      return response;
    })
    .finally(() => {
      inFlightSearches.delete(key);
    });

  inFlightSearches.set(key, search);

  return search;
}
