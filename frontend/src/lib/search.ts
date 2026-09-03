import type { Product } from '@/types';
import { API_URL } from '@/lib/api';

type BackendOffer = {
  id: string;
  marketplace: 'kabum';
  title: string;
  url: string;
  price: number;
  priceType: 'cash' | 'listed';
  originalPrice?: number;
  cardPrice?: number;
  installments?: string;
  installmentsInterestFree?: boolean;
  availability: 'in-stock' | 'out-of-stock' | 'unknown';
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
};

type SearchResponse = {
  offers: BackendOffer[];
  summary: string;
};

function availabilityLabel(availability: BackendOffer['availability']): string | undefined {
  if (availability === 'in-stock') return 'Disponível';
  if (availability === 'out-of-stock') return 'Indisponível';
  return undefined;
}

function toProduct(offer: BackendOffer, index: number): Product {
  return {
    id: offer.id,
    name: offer.title,
    store: 'KaBuM!',
    price: offer.price,
    priceLabel: offer.priceType === 'cash' ? 'Preço à vista' : 'Preço anunciado',
    originalPrice: offer.originalPrice,
    cardPrice: offer.cardPrice,
    url: offer.url,
    rating: offer.rating,
    reviews: offer.reviewCount,
    installments: offer.installments,
    installmentsInterestFree: offer.installmentsInterestFree,
    availability: availabilityLabel(offer.availability),
    imageUrl: offer.imageUrl,
    storeLogoUrl: 'https://static.kabum.com.br/conteudo/icons/logo.svg',
    badge: index === 0 ? 'Mais barato' : undefined,
    logoColor: '#ff6500',
  };
}

export async function searchProducts(query: string): Promise<{
  products: Product[];
  summary: string;
}> {
  const response = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = (await response.json().catch(() => null)) as SearchResponse | { error?: string } | null;

  if (!response.ok || !data || !('offers' in data)) {
    throw new Error(
      data && 'error' in data && data.error
        ? data.error
        : 'Não foi possível pesquisar ofertas na KaBuM agora.',
    );
  }

  return {
    products: data.offers.map(toProduct),
    summary: data.summary,
  };
}

export const SUGGESTIONS = [
  'RTX 5070 12GB',
  'Ryzen 7 7800X3D',
  'SSD NVMe 1TB',
  'Memória DDR5 32GB',
];
