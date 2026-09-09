import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, Loader2, LogOut, Phone, User } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/auth';

type Props = { onBack: () => void; onSignOut: () => void };

export default function AccountPage({ onBack, onSignOut }: Props) {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  async function handleSave() {
    setError(null); setSaved(false);
    if (!fullName.trim()) return setError('O nome não pode ficar vazio.');
    setSaving(true);
    const result = await updateProfile({ full_name: fullName.trim(), phone: phone.trim() || null });
    setSaving(false);
    if (result.error) return setError(result.error);
    setSaved(true); window.setTimeout(() => setSaved(false), 3000);
  }

  async function handleSignOut() { await signOut(); onSignOut(); }
  const initials = (profile?.full_name || user?.email || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return <div className="min-h-screen bg-ink-50">
    <header className="border-b border-ink-200 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8"><Logo size="sm" /><button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800"><ArrowLeft size={17} /> Voltar ao chat</button></div></header>
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Minha conta</h1><p className="mt-1.5 text-sm text-ink-500">Gerencie suas informações pessoais.</p>
      <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-4 sm:p-8"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">{initials}</div><div className="min-w-0"><p className="truncate font-display text-lg font-bold text-ink-900">{profile?.full_name || 'Usuário'}</p><p className="truncate text-sm text-ink-500">{user?.email || 'E-mail de demonstração'}</p></div></div><div className="my-7 h-px bg-ink-100" />
        <div className="space-y-5"><Field label="Nome completo" icon={<User size={16} />}><input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Seu nome" className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /></Field><Field label="Telefone (opcional)" icon={<Phone size={16} />}><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400" /></Field><div><span className="mb-1.5 block text-xs font-semibold text-ink-600">E-mail</span><div className="break-all rounded-xl border border-ink-100 bg-ink-50/60 px-3.5 py-3 text-sm text-ink-500">{user?.email || 'E-mail de demonstração'}</div></div>{error && <p className="rounded-lg bg-error-500/10 px-3 py-2 text-xs font-medium text-error-600">{error}</p>}<div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center"><button onClick={() => void handleSave()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-60 sm:w-auto">{saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar alterações</button>{saved && <span className="animate-fade-in text-center text-sm font-medium text-brand-600 sm:text-left">Alterações salvas!</span>}</div></div>
      </div>
      <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-4 sm:p-8"><button onClick={() => void handleSignOut()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-error-500/30 bg-error-500/5 px-5 py-3 text-sm font-semibold text-error-600 hover:bg-error-500/10"><LogOut size={16} /> Sair</button></div>
    </main>
  </div>;
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-600">{label}</span><div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 focus-within:border-brand-400 focus-within:bg-white"><span className="text-ink-400">{icon}</span>{children}</div></label>; }
