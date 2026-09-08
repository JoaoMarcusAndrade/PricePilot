export type Role = 'user' | 'assistant';

export type Product = {
  id: string;
  name: string;
  store: string;
  price: number;
  priceLabel?: string;
  originalPrice?: number;
  cardPrice?: number;
  url: string;
  rating?: number;
  reviews?: number;
  installments?: string;
  installmentsInterestFree?: boolean;
  availability?: string;
  imageUrl?: string;
  storeLogoUrl?: string;
  badge?: string;
  logoColor: string;
};

export type SearchSource = {
  marketplace: 'kabum' | 'terabyte' | 'pichau' | 'patoloco';
  status: 'ok' | 'unavailable';
  resultCount: number;
  message?: string;
};

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  products?: Product[];
  sources?: SearchSource[];
  status?: 'searching' | 'thinking' | 'done';
};

export type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};
