import type { Availability, Offer } from "../../contracts/search.js";

const KABUM_ORIGIN = "https://www.kabum.com.br";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asIdentifier(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return String(value);
  }

  return asString(value);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function absoluteKabumUrl(value: unknown): string | undefined {
  const url = asString(value);

  if (!url) {
    return undefined;
  }

  try {
    const resolved = new URL(url, KABUM_ORIGIN);

    return resolved.hostname.endsWith("kabum.com.br") ? resolved.toString() : undefined;
  } catch {
    return undefined;
  }
}

function availability(value: unknown): Availability {
  if (value === true) {
    return "in-stock";
  }

  if (value === false) {
    return "out-of-stock";
  }

  return "unknown";
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type Installment = {
  quantity: number;
  amount: number;
  label: string;
};

function installmentInfo(value: unknown): Installment | undefined {
  if (typeof value === "string") {
    const match = value.match(/(\d+)\s*x\s*de\s*R\$\s*([\d.,]+)/i);

    if (!match) {
      return undefined;
    }

    const quantity = asNumber(match[1]);
    const amount = asNumber(match[2]);

    return quantity && amount ? { quantity, amount, label: `${quantity}x de ${formatBRL(amount)}` } : undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const quantity = asNumber(
    value.quantity ?? value.installments ?? value.numberOfInstallments,
  );
  const amount = asNumber(value.value ?? value.amount ?? value.installmentValue);

  return quantity && amount ? { quantity, amount, label: `${quantity}x de ${formatBRL(amount)}` } : undefined;
}

function isInterestFree(installment: Installment | undefined, cardPrice: number | undefined): boolean {
  if (!installment || !cardPrice) {
    return false;
  }

  return Math.abs(installment.quantity * installment.amount - cardPrice) <= installment.quantity / 100;
}

function imageUrl(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return absoluteKabumUrl(value[0]);
  }

  return absoluteKabumUrl(value);
}

function nextDataProducts(html: string): unknown[] {
  const match = html.match(
    /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  );

  if (!match) {
    return [];
  }

  try {
    const nextData = JSON.parse(match[1]) as JsonRecord;
    const props = isRecord(nextData.props) ? nextData.props : undefined;
    const pageProps = props && isRecord(props.pageProps) ? props.pageProps : undefined;
    const pageData = pageProps?.data;
    const catalog = typeof pageData === "string"
      ? JSON.parse(pageData) as unknown
      : pageData;
    const catalogData = isRecord(catalog) && isRecord(catalog.catalogServer)
      ? catalog.catalogServer.data
      : isRecord(catalog)
        ? catalog.data
        : undefined;

    return Array.isArray(catalogData) ? catalogData : [];
  } catch {
    return [];
  }
}

function fallbackProducts(html: string): unknown[] {
  const matches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const products: unknown[] = [];

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1]) as unknown;
      const entries = Array.isArray(parsed) ? parsed : [parsed];

      for (const entry of entries) {
        if (isRecord(entry) && entry["@type"] === "Product") {
          products.push(entry);
        }
      }
    } catch {
      // A resposta principal continua utilizável quando um bloco JSON-LD for inválido.
    }
  }

  return products;
}

function offerFromNextData(item: unknown, collectedAt: string): Offer | undefined {
  if (!isRecord(item)) {
    return undefined;
  }

  const title = asString(item.name);
  const code = asIdentifier(item.code);
  const offer = isRecord(item.offer) ? item.offer : undefined;
  const cashPrice = asNumber(offer?.priceWithDiscount ?? item.priceWithDiscount);
  const listedPrice = asNumber(item.price);
  const price = cashPrice ?? listedPrice;

  if (!title || !code || !price || price <= 0) {
    return undefined;
  }

  const generatedUrl = (() => {
    const friendlyName = asString(item.friendlyName);

    return friendlyName ? `/produto/${code}/${friendlyName}` : undefined;
  })();
  const url = absoluteKabumUrl(item.externalUrl ?? generatedUrl);

  if (!url) {
    return undefined;
  }

  const rating = asNumber(item.averageRating);
  const reviewCount = asNumber(item.ratingCount);
  const installment = installmentInfo(item.maxInstallment);
  const productImage = imageUrl(item.image ?? item.images);
  const originalPrice = asNumber(item.oldPrice);

  return {
    id: `kabum:${code}`,
    marketplace: "kabum",
    title,
    url,
    price,
    priceType: cashPrice ? "cash" : "listed",
    ...(originalPrice && originalPrice > price ? { originalPrice } : {}),
    ...(cashPrice && listedPrice ? { cardPrice: listedPrice } : {}),
    ...(installment ? { installments: installment.label } : {}),
    ...(isInterestFree(installment, listedPrice) ? { installmentsInterestFree: true } : {}),
    availability: availability(item.available),
    ...(productImage ? { imageUrl: productImage } : {}),
    ...(rating && rating > 0 && reviewCount && reviewCount > 0
      ? { rating, reviewCount }
      : {}),
    collectedAt,
  };
}

function offerFromJsonLd(item: unknown, collectedAt: string): Offer | undefined {
  if (!isRecord(item)) {
    return undefined;
  }

  const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
  const offerData = isRecord(offer) ? offer : undefined;
  const title = asString(item.name);
  const url = absoluteKabumUrl(offerData?.url ?? item.url);
  const price = asNumber(offerData?.price ?? offerData?.lowPrice);

  if (!title || !url || !price || price <= 0) {
    return undefined;
  }

  const ratingData = isRecord(item.aggregateRating) ? item.aggregateRating : undefined;
  const rating = asNumber(ratingData?.ratingValue);
  const reviewCount = asNumber(ratingData?.reviewCount);
  const productImage = imageUrl(item.image);

  return {
    id: `kabum:${url}`,
    marketplace: "kabum",
    title,
    url,
    price,
    priceType: "listed",
    availability: availability(
      asString(offerData?.availability)?.endsWith("InStock"),
    ),
    ...(productImage ? { imageUrl: productImage } : {}),
    ...(rating && rating > 0 && reviewCount && reviewCount > 0
      ? { rating, reviewCount }
      : {}),
    collectedAt,
  };
}

export function parseKabumSearchPage(html: string, limit: number): Offer[] {
  const collectedAt = new Date().toISOString();
  const products = nextDataProducts(html);
  const candidates = products.length > 0 ? products : fallbackProducts(html);
  const offers: Offer[] = [];
  const seenUrls = new Set<string>();

  for (const candidate of candidates) {
    const offer = products.length > 0
      ? offerFromNextData(candidate, collectedAt)
      : offerFromJsonLd(candidate, collectedAt);

    if (!offer || seenUrls.has(offer.url)) {
      continue;
    }

    seenUrls.add(offer.url);
    offers.push(offer);

    if (offers.length === limit) {
      break;
    }
  }

  return offers;
}

function timeoutMs(): number {
  const value = Number(process.env.KABUM_SEARCH_TIMEOUT_MS ?? 5000);

  return Number.isFinite(value) && value > 0 ? value : 5000;
}

export async function searchKabum(query: string, limit: number): Promise<Offer[]> {
  const url = new URL(`/busca/${encodeURIComponent(query)}`, KABUM_ORIGIN);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs());
  const contact = asString(process.env.KABUM_SCRAPER_CONTACT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "User-Agent": contact
          ? `Mozilla/5.0 (compatible; PricePilot/1.0; +${contact})`
          : "Mozilla/5.0 (compatible; PricePilot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`A KaBuM respondeu HTTP ${response.status}.`);
    }

    return parseKabumSearchPage(await response.text(), limit);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A KaBuM demorou mais que o limite permitido para responder.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
