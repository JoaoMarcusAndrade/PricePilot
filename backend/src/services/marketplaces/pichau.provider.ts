import type { Availability, Offer } from "../../contracts/search.js";

const PICHAU_ORIGIN = "https://www.pichau.com.br";

function text(value: string): string {
  return value
    .replace(/<!--.*?-->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function price(value: string): number | undefined {
  const numeric = value.replace(/[^\d.,]/g, "");
  const normalized = numeric.includes(",") && numeric.includes(".")
    ? numeric.replace(/,/g, "")
    : numeric.replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function attribute(markup: string, name: string): string | undefined {
  return markup.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
}

function classContent(markup: string, className: string, tagName: string): string | undefined {
  const match = markup.match(new RegExp(`<${tagName}[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));

  return match?.[1];
}

function absolutePichauUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value, PICHAU_ORIGIN);

    return url.hostname.endsWith("pichau.com.br") ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function availability(card: string): Availability {
  if (card.includes("availability_span_available")) {
    return "in-stock";
  }

  return "unknown";
}

function installmentLabel(value: string): string | undefined {
  const match = text(value).match(/(?:em até\s*)?(\d+)x\s*de\s*R\$\s*([\d.,]+)/i);
  const quantity = match?.[1];
  const amount = match ? price(match[2]) : undefined;

  if (!quantity || !amount) {
    return undefined;
  }

  return `${quantity}x de ${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}

export function parsePichauSearchPage(html: string, limit: number): Offer[] {
  const cards = html.matchAll(/<a\b(?=[^>]*data-cy=["']list-product["'])([^>]*)>([\s\S]*?)<\/a>/gi);
  const offers: Offer[] = [];
  const seenUrls = new Set<string>();
  const collectedAt = new Date().toISOString();

  for (const card of cards) {
    const url = absolutePichauUrl(attribute(card[1], "href"));
    const title = text(classContent(card[2], "product_info_title", "h2") ?? "");
    const cashPrice = price(text(classContent(card[2], "price_vista", "div") ?? ""));

    if (!url || !title || !cashPrice || seenUrls.has(url)) {
      continue;
    }

    const image = card[2].match(/<img\b([^>]*)>/i);
    const originalPrice = price(text(classContent(card[2], "strikeThrough", "span") ?? ""));
    const cardPrice = price(text(classContent(card[2], "price_total", "div") ?? ""));
    const installments = installmentLabel(classContent(card[2], "price_parcelado_text", "p") ?? "");

    // The product URL is the stable identifier exposed by Pichau's result cards.
    seenUrls.add(url);
    offers.push({
      id: `pichau:${new URL(url).pathname}`,
      marketplace: "pichau",
      title,
      url,
      price: cashPrice,
      priceType: "cash",
      ...(originalPrice && originalPrice > cashPrice ? { originalPrice } : {}),
      ...(cardPrice && cardPrice > cashPrice ? { cardPrice } : {}),
      ...(installments ? { installments, installmentsInterestFree: /sem juros/i.test(text(card[2])) } : {}),
      availability: availability(card[2]),
      ...(absolutePichauUrl(image ? attribute(image[1], "src") : undefined)
        ? { imageUrl: absolutePichauUrl(image ? attribute(image[1], "src") : undefined) }
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
  const value = Number(process.env.PICHAU_SEARCH_TIMEOUT_MS ?? 8000);

  return Number.isFinite(value) && value > 0 ? value : 8000;
}

export async function searchPichau(query: string, limit: number): Promise<Offer[]> {
  const url = new URL("/search", PICHAU_ORIGIN);
  url.searchParams.set("q", query);
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
      throw new Error(`A Pichau respondeu HTTP ${response.status}.`);
    }

    const offers = parsePichauSearchPage(await response.text(), limit);

    if (offers.length === 0) {
      throw new Error("A Pichau respondeu sem ofertas reconhecíveis.");
    }

    return offers;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A Pichau demorou mais que o limite permitido para responder.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
