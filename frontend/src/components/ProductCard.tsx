import type { Product } from '@/types';
import { CheckCircle2, ExternalLink, TrendingDown, Award, Star } from 'lucide-react';

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-16 shrink-0 place-items-center rounded-lg bg-brand-50 px-1">
            {product.storeLogoUrl ? (
              <img src={product.storeLogoUrl} alt={`Logo ${product.store}`} className="max-h-6 w-full object-contain" />
            ) : (
              <span className="text-xs font-bold text-white" style={{ color: product.logoColor }}>{product.store.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{product.store}</p>
            {product.rating !== undefined && product.reviews !== undefined && (
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Star size={12} className="fill-accent-400 text-accent-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-ink-300">·</span>
                <span>{product.reviews.toLocaleString('pt-BR')}</span>
              </div>
            )}
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

      <div className="mt-4 flex gap-3">
        {product.imageUrl && (
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-ink-50 p-2">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink-800">{product.name}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="mt-2 text-xs text-ink-400 line-through">De {formatBRL(product.originalPrice)}</p>
          )}
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatBRL(product.price)}</p>
          {product.priceLabel && <p className="text-xs font-medium text-brand-700">{product.priceLabel}</p>}
          {product.cardPrice && (
            <p className="mt-2 text-xs text-ink-600">No cartão: {formatBRL(product.cardPrice)}</p>
          )}
          {product.installments && (
            <p className="mt-0.5 text-xs text-ink-500">
              {product.installments}{product.installmentsInterestFree ? ' sem juros' : ''}
            </p>
          )}
          {product.availability && (
            <div className="mt-2 flex items-center gap-1 text-xs text-ink-500">
              <CheckCircle2 size={12} />
              {product.availability}
            </div>
          )}
        </div>
      </div>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg bg-ink-50 px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
      >
        Ver na KaBuM!
        <ExternalLink size={13} />
      </a>
    </div>
  );
}
