import type { Product } from '@/types';
import { Star, Truck, ExternalLink, TrendingDown, Award } from 'lucide-react';

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-ink-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-ink-200/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: product.logoColor }}
          >
            {product.store.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{product.store}</p>
            <div className="flex items-center gap-1 text-xs text-ink-500">
              <Star size={12} className="fill-accent-400 text-accent-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-ink-300">·</span>
              <span>{product.reviews.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
        {product.badge && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.badge === 'Mais barato'
                ? 'bg-brand-50 text-brand-700'
                : 'bg-accent-50 text-accent-700'
            }`}
          >
            {product.badge === 'Mais barato' ? (
              <TrendingDown size={12} strokeWidth={2.5} />
            ) : (
              <Award size={12} strokeWidth={2.5} />
            )}
            {product.badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-ink-900">{formatBRL(product.price)}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <Truck size={12} />
            {product.shipping}
          </div>
        </div>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-ink-50 px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          Ver loja
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
