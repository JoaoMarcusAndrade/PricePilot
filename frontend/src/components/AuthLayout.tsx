import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

type Props = {
  onBack: () => void;
  children: ReactNode;
};

export default function AuthLayout({ onBack, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:grid lg:grid-cols-2">
      <div className="relative flex flex-col px-5 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
          >
            <ArrowLeft size={17} /> Início
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center px-16">
          <p className="font-display text-4xl font-extrabold leading-tight text-white">
            Compre melhor.<br />
            <span className="text-brand-400">Pague menos.</span>
          </p>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink-300">
            Converse com a IA, compare preços de dezenas de lojas e tome a melhor decisão de compra.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#19a85a', '#ff9d20', '#3b82f6', '#e5484d'].map((color, i) => (
                <span
                  key={color}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink-950 text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {['M', 'A', 'J', 'R'][i]}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink-400">
              <strong className="text-white">+12 mil pessoas</strong> já compram melhor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
