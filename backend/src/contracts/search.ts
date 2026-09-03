export type Marketplace = "kabum";

export type Availability = "in-stock" | "out-of-stock" | "unknown";

export type PriceType = "cash" | "listed";

export type Offer = {
  id: string;
  marketplace: Marketplace;
  title: string;
  url: string;
  price: number;
  priceType: PriceType;
  originalPrice?: number;
  cardPrice?: number;
  installments?: string;
  installmentsInterestFree?: boolean;
  availability: Availability;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  collectedAt: string;
};

export type SearchSource = {
  marketplace: Marketplace;
  status: "ok" | "unavailable";
  resultCount: number;
  message?: string;
};

export type SearchResponse = {
  query: string;
  searchedAt: string;
  offers: Offer[];
  source: SearchSource;
  summary: string;
};
