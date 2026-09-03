import { ArrowRight, Check, Search, ShieldCheck, Sparkles, TrendingDown, Zap } from 'lucide-react';
import Logo from '@/components/Logo';

type Props = {
  onStart: (prompt?: string) => void;
  onAuth: () => void;
};

const steps = [
  { icon: Search, number: '01', title: 'Diga o que você procura', text: 'Conte para o PricePilot qual produto você quer comparar.' },
  { icon: Zap, number: '02', title: 'A busca encontra ofertas', text: 'O PricePilot consulta ofertas e condições publicadas pelas lojas participantes.' },
  { icon: Check, number: '03', title: 'Escolha com confiança', text: 'Receba uma recomendação clara para comprar pelo melhor custo-benefício.' },
];

const trustedStores = ['KaBuM!'];

export default function LandingPage({ onStart, onAuth }: Props) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
          <a href="#como-funciona" className="transition-colors hover:text-brand-600">Como funciona</a>
          <a href="#vantagens" className="transition-colors hover:text-brand-600">Vantagens</a>
          <button onClick={onAuth} className="rounded-full bg-ink-900 px-5 py-2.5 text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20">Entrar / cadastrar</button>
        </nav>
        <button onClick={onAuth} className="min-h-11 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white md:hidden">Entrar</button>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -right-24 -top-20 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-56 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-brand-700 sm:text-xs">
                <Sparkles size={14} /> Seu assistente de compras inteligente
              </div>
              <h1 className="max-w-xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-950 sm:text-6xl lg:text-[4.3rem]">
                Compre melhor.<br /><span className="text-brand-600">Pague menos.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600 sm:text-xl">
                 Pesquise ofertas de hardware e receba uma recomendação clara para tomar a melhor decisão de compra.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => onStart()} className="group inline-flex items-center justify-center gap-3 rounded-xl bg-brand-600 px-6 py-4 font-bold text-white shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-brand-600/35">
                  Encontrar melhores preços <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <a href="#como-funciona" className="inline-flex items-center justify-center rounded-xl border border-ink-200 px-6 py-4 font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50">Como funciona</a>
              </div>
              <div className="mt-8 flex items-center gap-3 text-sm text-ink-500">
                <div className="flex -space-x-2">
                  {['#19a85a', '#ff9d20', '#3b82f6', '#e5484d'].map((color, i) => <span key={color} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-xs font-bold text-white" style={{ background: color }}>{['M', 'A', 'J', 'R'][i]}</span>)}
                </div>
                <span><strong className="text-ink-700">+12 mil pessoas</strong> já compram melhor</span>
              </div>
            </div>

            <div className="relative animate-slide-up lg:pl-5">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-brand-100/70 to-accent-100/40 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-2xl shadow-ink-900/10">
                <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/80 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3"><Logo size="sm" /><span className="hidden text-xs font-semibold text-ink-500 sm:inline">Busca inteligente</span></div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> Online</span>
                </div>
                <div className="space-y-5 p-5 sm:p-7">
                  <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-ink-900 px-4 py-3 text-sm leading-relaxed text-white shadow-md">Quero uma RTX 5070. Quais são as ofertas?</div>
                  <div className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700"><Sparkles size={15} /></div><div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-ink-100 bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">Encontrei <strong className="text-ink-900">ofertas atuais</strong> na <strong className="text-brand-700">KaBuM!</strong> para você comparar.</div></div>
                  <div className="ml-11 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-brand-300 bg-brand-50/50 p-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-ink-700">KaBuM!</span><span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">Ofertas atuais</span></div><p className="mt-2 text-lg font-bold text-ink-900">Ofertas reais</p><p className="mt-1 text-[11px] text-brand-700">Consulte os valores atualizados no chat</p></div>
                    <div className="rounded-xl border border-ink-200 p-3"><span className="text-xs font-bold text-ink-700">Hardware</span><p className="mt-2 text-lg font-bold text-ink-900">Busca focada</p><p className="mt-1 text-[11px] text-ink-500">GPU, CPU, SSD, memória e mais</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-ink-100 p-4"><span className="flex-1 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-400">Pergunte outra coisa...</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><ArrowRight size={16} /></span></div>
              </div>
              <div className="absolute -right-4 top-20 hidden animate-float rounded-2xl border border-ink-100 bg-white p-3 shadow-xl sm:block"><div className="flex items-center gap-2"><TrendingDown size={18} className="text-brand-600" /><div><p className="text-[10px] font-semibold text-ink-500">Você economiza</p><p className="text-sm font-bold text-brand-700">até R$ 800</p></div></div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-ink-100 bg-ink-50/60 px-5 py-7 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-center gap-5 sm:flex-row sm:justify-between"><p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Pesquisamos nas melhores lojas</p><div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm font-bold text-ink-400 sm:justify-end">{trustedStores.map(store => <span key={store} className="transition-colors hover:text-ink-700">{store}</span>)}</div></div></section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-2xl text-center"><span className="text-sm font-bold uppercase tracking-widest text-brand-600">Simples assim</span><h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Sua próxima compra começa aqui</h2><p className="mt-4 text-ink-500">Sem abrir dezenas de abas. Sem perder horas comparando. Só uma conversa simples e uma decisão inteligente.</p></div><div className="mt-14 grid gap-8 md:grid-cols-3">{steps.map(({ icon: Icon, number, title, text }) => <div key={number} className="group relative rounded-2xl border border-ink-100 bg-white p-7 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-ink-200/40"><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white"><Icon size={22} /></div><span className="font-display text-4xl font-bold text-ink-100">{number}</span></div><h3 className="mt-7 font-display text-lg font-bold text-ink-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p></div>)}</div></section>

        <section id="vantagens" className="bg-ink-950 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2"><div><span className="text-sm font-bold uppercase tracking-widest text-brand-400">Por que PricePilot?</span><h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-tight sm:text-4xl">Mais clareza para cada decisão de compra.</h2><p className="mt-5 max-w-lg leading-relaxed text-ink-300">O PricePilot combina busca inteligente com uma conversa que entende o que realmente importa para você.</p><button onClick={() => onStart()} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-brand-500 px-6 py-3.5 font-bold text-white transition-all hover:bg-brand-400">Testar agora <ArrowRight size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2">{[{icon: TrendingDown, title: 'Economize de verdade', text: 'Compare preços atuais e encontre ofertas que valem a pena.'}, {icon: ShieldCheck, title: 'Compre com segurança', text: 'Veja avaliações e condições antes de decidir.'}, {icon: Sparkles, title: 'Converse naturalmente', text: 'Faça perguntas do seu jeito. A IA entende o contexto.'}, {icon: Zap, title: 'Resultado em segundos', text: 'Chega de pesquisa demorada e dezenas de abas abertas.'}].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5"><Icon size={20} className="text-brand-400" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-400">{text}</p></div>)}</div></div></section>
      </main>
      <footer className="border-t border-ink-100 bg-white px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row"><Logo size="sm" /><p className="text-xs text-ink-400">© 2024 PricePilot. Compras mais inteligentes.</p></div></footer>
    </div>
  );
}
