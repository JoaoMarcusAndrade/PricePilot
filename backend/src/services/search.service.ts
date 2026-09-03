import type { SearchResponse } from "../contracts/search.js";
import { searchKabum } from "./marketplaces/kabum.provider.js";

const MAX_QUERY_LENGTH = 120;
const RESULTS_PER_SEARCH = 5;
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
    return `Não encontrei ofertas da KaBuM para "${query}" agora. Tente informar marca, modelo ou especificações do hardware.`;
  }

  const cheapest = offers[0];
  const countLabel = offers.length === 1 ? "oferta" : "ofertas";
  const priceLabel = cheapest.priceType === "cash"
    ? "menor preço à vista"
    : "menor preço anunciado";

  return `Encontrei **${offers.length} ${countLabel}** na KaBuM para "${query}". O ${priceLabel} é **${formatBRL(cheapest.price)}** para **${cheapest.title}**.`;
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
  let offers;

  try {
    offers = await searchKabum(query, RESULTS_PER_SEARCH);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida na KaBuM.";

    throw new SearchSourceError(message);
  }

  offers.sort((first, second) =>
    first.price - second.price || first.title.localeCompare(second.title, "pt-BR"),
  );

  return {
    query,
    searchedAt: new Date().toISOString(),
    offers,
    source: {
      marketplace: "kabum",
      status: "ok",
      resultCount: offers.length,
    },
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

      cache.set(key, {
        expiresAt: now + CACHE_TTL_MS,
        response,
      });

      return response;
    })
    .finally(() => {
      inFlightSearches.delete(key);
    });

  inFlightSearches.set(key, search);

  return search;
}
