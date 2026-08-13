import { useState, type ReactNode } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

type Props = {
  onSubmit: (email: string, password: string) => Promise<{ error: string | null }>;
  onGoogle: () => Promise<void>;
  onToggle: () => void;
};

export default function LoginForm({ onSubmit, onGoogle, onToggle }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) return setError('Preencha e-mail e senha para continuar.');
    setLoading(true);
    const result = await onSubmit(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return <div className="animate-fade-in">
    <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Bem-vindo de volta</h1>
    <p className="mt-2 text-sm text-ink-500">Entre para continuar comparando as melhores ofertas.</p>
    <button onClick={onGoogle} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition-all hover:border-ink-300 hover:bg-ink-50"><GoogleIcon /> Entrar com Google</button>
    <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-ink-100" /><span className="text-xs font-medium text-ink-400">ou com e-mail</span><div className="h-px flex-1 bg-ink-100" /></div>
    <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }} className="space-y-4">
      <Field label="E-mail" icon={<Mail size={16} />}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /></Field>
      <Field label="Senha" icon={<Lock size={16} />}><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="text-ink-400 hover:text-ink-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></Field>
      {error && <p className="rounded-lg bg-error-500/10 px-3 py-2 text-xs font-medium text-error-600">{error}</p>}
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-60">{loading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar <ArrowRight size={16} /></>}</button>
    </form>
    <p className="mt-6 text-center text-sm text-ink-500">Não tem conta? <button onClick={onToggle} className="font-bold text-brand-600 hover:text-brand-700">Cadastre-se grátis</button></p>
  </div>;
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-600">{label}</span><div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 focus-within:border-brand-400 focus-within:bg-white"><span className="text-ink-400">{icon}</span>{children}</div></label>; }

function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>; }
