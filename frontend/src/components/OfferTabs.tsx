import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product, SearchSource } from '@/types';

type StoreTab = {
  id: 'kabum' | 'terabyte' | 'pichau' | 'patoloco';
  label: string;
  store: string;
};

const STORE_TABS: StoreTab[] = [
  { id: 'kabum', label: 'KaBuM!', store: 'KaBuM!' },
  { id: 'terabyte', label: 'Terabyte', store: 'Terabyte' },
  { id: 'pichau', label: 'Pichau', store: 'Pichau' },
  { id: 'patoloco', label: 'Patoloco', store: 'Patoloco' },
];

type Props = {
  products: Product[];
  sources?: SearchSource[];
};

export default function OfferTabs({ products, sources = [] }: Props) {
  const [activeStore, setActiveStore] = useState<StoreTab['id']>('kabum');
  const activeTab = STORE_TABS.find((tab) => tab.id === activeStore) ?? STORE_TABS[0];
  // Filtering preserves the provider's price ordering while isolating each storefront.
  const offers = products.filter((product) => product.store === activeTab.store);
  const source = sources.find((item) => item.marketplace === activeTab.id);

  return (
    <section className="mt-3" aria-label="Ofertas por loja">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-1" role="tablist" aria-label="Lojas">
        {STORE_TABS.map((tab) => {
          const offerCount = products.filter((product) => product.store === tab.store).length;
          const selected = activeStore === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`offers-${tab.id}`}
              onClick={() => setActiveStore(tab.id)}
              className={`min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:bg-white/70 hover:text-ink-800'
              }`}
            >
              {tab.label} <span className="text-ink-400">{offerCount}</span>
            </button>
          );
        })}
      </div>

      <div id={`offers-${activeTab.id}`} role="tabpanel" className="pt-3">
        {source?.status === 'unavailable' ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
            <CircleAlert size={16} className="mt-0.5 shrink-0" />
            <span>{activeTab.label} está indisponível nesta busca. Tente novamente em instantes.</span>
          </div>
        ) : offers.length === 0 ? (
          <p className="rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-xs text-ink-500">
            Nenhuma oferta encontrada na {activeTab.label}.
          </p>
        ) : (
          <>
            <p className="mb-3 px-1 text-xs text-ink-500">
              {offers.length} ofertas ordenadas por menor preço
            </p>
            <div className="grid gap-3 xl:grid-cols-2">
              {offers.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
