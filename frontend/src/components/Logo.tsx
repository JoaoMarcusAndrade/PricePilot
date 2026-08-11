import { Search, Sparkles } from 'lucide-react';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

export default function Logo({ size = 'md', showText = true }: Props) {
  const dims = {
    sm: { box: 'h-8 w-8', icon: 16, text: 'text-base' },
    md: { box: 'h-10 w-10', icon: 20, text: 'text-lg' },
    lg: { box: 'h-12 w-12', icon: 24, text: 'text-xl' },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${dims.box} relative grid place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30`}
      >
        <Search size={dims.icon} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-accent-500 ring-2 ring-white">
          <Sparkles size={9} strokeWidth={3} className="text-white" />
        </span>
      </div>
      {showText && (
        <span className={`font-display font-extrabold tracking-tight ${dims.text} text-ink-900`}>
          Price<span className="text-brand-600">Pilot</span>
        </span>
      )}
    </div>
  );
}
