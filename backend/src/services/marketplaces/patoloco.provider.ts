import type { Availability, Offer } from "../../contracts/search.js";

const PATOLOCO_ORIGIN = "https://patoloco.com.br";

function text(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function price(value: string): number | undefined {
  const numeric = value.match(/R\$\s*([\d.,]+)/i)?.[1] ?? value.replace(/[^\d.,]/g, "");
  const normalized = numeric.includes(",") && numeric.includes(".")
    ? numeric.replace(/\./g, "").replace(",", ".")
    : numeric.replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function attribute(markup: string, name: string): string | undefined {
  return markup.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
}

function classContent(markup: string, className: string): string | undefined {
  const match = markup.match(new RegExp(`<[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i"));

  return match?.[1];
}

function paragraphContent(markup: string, className: string): string | undefined {
  const match = markup.match(new RegExp(`<p[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/p>`, "i"));

  return match?.[1];
}

function absolutePatolocoUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value, PATOLOCO_ORIGIN);

    return url.hostname.endsWith("patoloco.com.br") ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cardBlocks(html: string): string[] {
  const starts = [...html.matchAll(/<article\b[^>]*class=["'][^"']*\bproduct\b[^"']*["'][^>]*>/gi)];

  // Product cards are siblings, so this avoids coupling the parser to their nested markup.
  return starts.map((match, index) => html.slice(match.index, starts[index + 1]?.index));
}

export function parsePatolocoSearchPage(html: string, limit: number): Offer[] {
  const offers: Offer[] = [];
  const seenUrls = new Set<string>();
  const collectedAt = new Date().toISOString();

  for (const card of cardBlocks(html)) {
    const productId = attribute(card, "id")?.match(/^variacao(.+)$/i)?.[1];
    const productInfo = classContent(card, "product-info");
    const productLink = productInfo?.match(/<a\b([^>]*)>/i);
    const url = absolutePatolocoUrl(productLink ? attribute(productLink[1], "href") : undefined);
    const title = text(classContent(card, "tit") ?? "");
    const currentPrice = price(text(paragraphContent(card, "price-new") ?? ""));

    if (!productId || !url || !title || !currentPrice || seenUrls.has(url)) {
      continue;
    }

    const image = card.match(/<img\b([^>]*)>/i);
    const originalPrice = price(text(paragraphContent(card, "price-old") ?? ""));
    const installments = text(paragraphContent(card, "price-installment") ?? "");

    seenUrls.add(url);
    offers.push({
      id: `patoloco:${productId}`,
      marketplace: "patoloco",
      title,
      url,
      price: currentPrice,
      priceType: "cash",
      ...(originalPrice && originalPrice > currentPrice ? { originalPrice } : {}),
      ...(installments ? { installments, installmentsInterestFree: /sem juros/i.test(installments) } : {}),
      availability: card.includes("product-unavailable") ? "out-of-stock" : "in-stock",
      ...(absolutePatolocoUrl(image ? attribute(image[1], "src") : undefined)
        ? { imageUrl: absolutePatolocoUrl(image ? attribute(image[1], "src") : undefined) }
        : {}),
      collectedAt,
    });

    if (offers.length === limit) {
      break;
    }
  }

  return offers;
}

function timeoutMs(): number {
  const value = Number(process.env.PATOLOCO_SEARCH_TIMEOUT_MS ?? 8000);

  return Number.isFinite(value) && value > 0 ? value : 8000;
}

export async function searchPatoloco(query: string, limit: number): Promise<Offer[]> {
  const url = new URL("/busca", PATOLOCO_ORIGIN);
  url.searchParams.set("buscar-por", query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs());

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "User-Agent": "Mozilla/5.0 (compatible; PricePilot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`A Patoloco respondeu HTTP ${response.status}.`);
    }

    const offers = parsePatolocoSearchPage(await response.text(), limit);

    if (offers.length === 0) {
      throw new Error("A Patoloco respondeu sem ofertas reconhecíveis.");
    }

    return offers;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A Patoloco demorou mais que o limite permitido para responder.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
