import type { Product } from '@/types';

type ProductTemplate = Omit<Product, 'id' | 'price' | 'url'> & {
  priceRange: [number, number];
};

const STORES: ProductTemplate[] = [
  {
    name: 'iPhone 15 Pro 128GB',
    store: 'Amazon',
    rating: 4.8,
    reviews: 2341,
    shipping: 'Frete grátis',
    badge: 'Melhor avaliado',
    logoColor: '#ff9900',
    priceRange: [6499, 7299],
  },
  {
    name: 'iPhone 15 Pro 128GB',
    store: 'Mercado Livre',
    rating: 4.7,
    reviews: 1820,
    shipping: 'Frete grátis',
    logoColor: '#ffe600',
    priceRange: [6299, 6999],
  },
  {
    name: 'iPhone 15 Pro 128GB',
    store: 'Magazine Luiza',
    rating: 4.6,
    reviews: 945,
    shipping: 'Frete grátis',
    logoColor: '#0086ff',
    priceRange: [6399, 7199],
  },
  {
    name: 'iPhone 15 Pro 128GB',
    store: 'Americanas',
    rating: 4.3,
    reviews: 612,
    shipping: 'Frete a calcular',
    logoColor: '#e6002e',
    priceRange: [6599, 7499],
  },
  {
    name: 'iPhone 15 Pro 128GB',
    store: 'Shopee',
    rating: 4.5,
    reviews: 1530,
    shipping: 'Frete grátis',
    badge: 'Mais barato',
    logoColor: '#ee4d2d',
    priceRange: [5999, 6499],
  },
];

function randPrice(range: [number, number]): number {
  const [min, max] = range;
  return Math.round((min + Math.random() * (max - min)) / 50) * 50;
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  const isPhone =
    /iphone|samsung|galaxy|xiaomi|redmi|pixel|motorola|celular|smartphone/i.test(
      lower
    );
  const isLaptop = /notebook|laptop|macbook|dell|lenovo|acer|asus/i.test(lower);
  const isHeadphone =
    /fone|headphone|airpod|earbud|jbl|bose|som|caixa de som|speaker/i.test(
      lower
    );

  let storeSet = STORES;
  let productBase = 'iPhone 15 Pro 128GB';

  if (isLaptop) {
    productBase = 'Notebook Lenovo IdeaPad 3';
    storeSet = STORES.map((s) => ({
      ...s,
      name: 'Notebook Lenovo IdeaPad 3',
      priceRange:
        s.store === 'Shopee'
          ? ([2199, 2599] as [number, number])
          : s.store === 'Amazon'
            ? ([2499, 2899] as [number, number])
            : s.store === 'Mercado Livre'
              ? ([2399, 2799] as [number, number])
              : s.store === 'Magazine Luiza'
                ? ([2599, 2999] as [number, number])
                : ([2699, 3199] as [number, number]),
    }));
  } else if (isHeadphone) {
    productBase = 'Fone JBL Tune 510BT';
    storeSet = STORES.map((s) => ({
      ...s,
      name: 'Fone JBL Tune 510BT',
      priceRange:
        s.store === 'Shopee'
          ? ([149, 199] as [number, number])
          : s.store === 'Amazon'
            ? ([179, 229] as [number, number])
            : s.store === 'Mercado Livre'
              ? ([169, 219] as [number, number])
              : s.store === 'Magazine Luiza'
                ? ([189, 249] as [number, number])
                : ([199, 269] as [number, number]),
    }));
  } else if (isPhone && !/iphone/i.test(lower)) {
    productBase = 'Samsung Galaxy S24 128GB';
    storeSet = STORES.map((s) => ({
      ...s,
      name: 'Samsung Galaxy S24 128GB',
      priceRange:
        s.store === 'Shopee'
          ? ([3199, 3699] as [number, number])
          : s.store === 'Amazon'
            ? ([3499, 3999] as [number, number])
            : s.store === 'Mercado Livre'
              ? ([3399, 3899] as [number, number])
              : s.store === 'Magazine Luiza'
                ? ([3599, 4099] as [number, number])
                : ([3699, 4299] as [number, number]),
    }));
  }

  return storeSet.map((tmpl) => {
    const price = randPrice(tmpl.priceRange);
    return {
      id: crypto.randomUUID(),
      name: productBase,
      store: tmpl.store,
      price,
      url: '#',
      rating: tmpl.rating,
      reviews: tmpl.reviews,
      shipping: tmpl.shipping,
      badge: tmpl.badge,
      logoColor: tmpl.logoColor,
    };
  });
}

export function buildAssistantReply(query: string, products: Product[]): string {
  if (products.length === 0) {
    return `Não consegui encontrar ofertas para "${query}". Tente ser mais específico — inclua marca e modelo para melhores resultados.`;
  }

  const sorted = [...products].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const bestRated = [...products].sort((a, b) => b.rating - a.rating)[0];
  const avg =
    Math.round(
      (products.reduce((s, p) => s + p.price, 0) / products.length) / 50
    ) * 50;
  const savings = avg - cheapest.price;

  return `Encontrei **${products.length} ofertas** para "${query}" em diferentes lojas.\n\n💰 **Menor preço:** ${cheapest.store} — R$ ${cheapest.price.toFixed(2).replace('.', ',')} (${cheapest.shipping.toLowerCase()})\n⭐ **Melhor avaliação:** ${bestRated.store} — nota ${bestRated.rating} (${bestRated.reviews.toLocaleString('pt-BR')} avaliações)\n📊 **Preço médio:** R$ ${avg.toFixed(2).replace('.', ',')}\n\nVocê pode economizar até **R$ ${savings.toFixed(2).replace('.', ',')}** escolhendo a opção mais barata. Quer que eu considere frete, prazo de entrega ou parcelamento para recomendar a melhor escolha?`;
}

export const SUGGESTIONS = [
  'iPhone 15 Pro 128GB',
  'Notebook Lenovo IdeaPad 3',
  'Fone JBL Tune 510BT',
  'Samsung Galaxy S24 128GB',
];
