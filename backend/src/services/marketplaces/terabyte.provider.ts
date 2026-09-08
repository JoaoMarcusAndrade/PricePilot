import type { Availability, Offer } from "../../contracts/search.js";

const TERABYTE_ORIGIN = "https://www.terabyteshop.com.br";

function text(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(?:x)?[\da-f]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function price(value: string): number | undefined {
  const parsed = Number(value.replace(/[^\d,]/g, "").replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function attribute(markup: string, name: string): string | undefined {
  const match = markup.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));

  return match?.[1];
}

function classContent(markup: string, className: string): string | undefined {
  const match = markup.match(new RegExp(`<[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i"));

  return match?.[1];
}

function elementWithClass(markup: string, tagName: string, className: string): RegExpMatchArray | undefined {
  const elements = markup.matchAll(new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi"));

  for (const element of elements) {
    if (new RegExp(`\\bclass=["'][^"']*\\b${className}\\b`, "i").test(element[1])) {
      return element;
    }
  }

  return undefined;
}

function imageWithClass(markup: string, className: string): string | undefined {
  const images = markup.matchAll(/<img\b([^>]*)>/gi);

  for (const image of images) {
    if (new RegExp(`\\bclass=["'][^"']*\\b${className}\\b`, "i").test(image[1])) {
      return attribute(image[1], "src");
    }
  }

  return undefined;
}

function absoluteTerabyteUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value, TERABYTE_ORIGIN);

    return url.hostname.endsWith("terabyteshop.com.br") ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function availability(value: string | undefined): Availability {
  if (value === "1") {
    return "in-stock";
  }

  if (value === "0") {
    return "out-of-stock";
  }

  return "unknown";
}

function cardBlocks(html: string): string[] {
  const marker = /<(?<tag>article|div)[^>]*class=["'][^"']*\bproduct-item\b[^"']*["'][^>]*>/gi;
  const starts = [...html.matchAll(marker)];

  // Each search card starts with product-item; slicing between starts avoids depending on nested div depth.
  return starts.map((match, index) => html.slice(match.index, starts[index + 1]?.index));
}

export function parseTerabyteSearchPage(html: string, limit: number): Offer[] {
  const offers: Offer[] = [];
  const seenUrls = new Set<string>();
  const collectedAt = new Date().toISOString();

  for (const block of cardBlocks(html)) {
    const productLink = elementWithClass(block, "a", "product-item__name");
    const id = attribute(block, "data-tss-add");
    const url = absoluteTerabyteUrl(productLink ? attribute(productLink[1], "href") : undefined);
    const title = productLink ? text(productLink[2]) : undefined;
    const cashPrice = price(text(classContent(block, "product-item__new-price") ?? ""));

    if (!id || !url || !title || !cashPrice || seenUrls.has(url)) {
      continue;
    }

    const image = imageWithClass(block, "image-thumbnail");
    const installments = text(classContent(block, "product-item__juros") ?? "");

    seenUrls.add(url);
    offers.push({
      id: `terabyte:${id}`,
      marketplace: "terabyte",
      title,
      url,
      price: cashPrice,
      priceType: "cash",
      ...(installments ? { installments } : {}),
      availability: availability(attribute(block, "data-tss-estoque")),
      ...(absoluteTerabyteUrl(image) ? { imageUrl: absoluteTerabyteUrl(image) } : {}),
      collectedAt,
    });

    if (offers.length === limit) {
      break;
    }
  }

  return offers;
}

function timeoutMs(): number {
  const value = Number(process.env.TERABYTE_SEARCH_TIMEOUT_MS ?? 8000);

  return Number.isFinite(value) && value > 0 ? value : 8000;
}

export async function searchTerabyte(query: string, limit: number): Promise<Offer[]> {
  const url = new URL("/busca", TERABYTE_ORIGIN);
  url.searchParams.set("str", query);

  let lastError: unknown;

  // A single retry handles intermittent first-request delays without retrying indefinitely.
  for (let attempt = 0; attempt < 2; attempt += 1) {
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
        throw new Error(`A Terabyte respondeu HTTP ${response.status}.`);
      }

      const offers = parseTerabyteSearchPage(await response.text(), limit);

      if (offers.length === 0) {
        throw new Error("A Terabyte respondeu sem ofertas reconhecíveis.");
      }

      return offers;
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError"
        ? new Error("A Terabyte demorou mais que o limite permitido para responder.")
        : error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}
