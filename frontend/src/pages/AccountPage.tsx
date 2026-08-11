import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, LogOut, Phone, User } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Props = {
  onBack: () => void;
  onSignOut: () => void;
};

export default function AccountPage({ onBack, onSignOut }: Props) {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    if (!fullName.trim()) {
      setError('O nome não pode ficar vazio.');
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq('id', user!.id);
    setSaving(false);
    if (updateError) {
      setError('Não foi possível salvar. Tente novamente.');
      return;
    }
    await refreshProfile();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  async function handleSignOut() {
    await signOut();
    onSignOut();
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <Loader2 size={28} className="animate-spin text-brand-600" />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url;
  const initials = (profile?.full_name || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Logo size="sm" />
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
          >
            <ArrowLeft size={17} /> Voltar ao chat
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Minha conta</h1>
        <p className="mt-1.5 text-sm text-ink-500">Gerencie suas informações pessoais.</p>

        <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold text-ink-900">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="truncate text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>

          <div className="my-7 h-px bg-ink-100" />

          <div className="space-y-5">
            <Field label="Nome completo" icon={<User size={16} />}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
              />
            </Field>

            <Field label="Telefone (opcional)" icon={<Phone size={16} />}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
              />
            </Field>

            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ink-600">E-mail</span>
                <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-ink-50/60 px-3.5 py-3 text-sm text-ink-500">
                  {user?.email}
                </div>
              </label>
              <p className="mt-1.5 text-xs text-ink-400">O e-mail não pode ser alterado nesta versão.</p>
            </div>

            {error && (
              <p className="rounded-lg bg-error-500/10 px-3 py-2 text-xs font-medium text-error-600">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Salvar alterações
              </button>
              {saved && (
                <span className="animate-fade-in text-sm font-medium text-brand-600">
                  Alterações salvas!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-ink-900">Sair da conta</h2>
          <p className="mt-1.5 text-sm text-ink-500">Encerre sua sessão neste dispositivo.</p>
          <button
            onClick={handleSignOut}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-error-500/30 bg-error-500/5 px-5 py-3 text-sm font-semibold text-error-600 transition-colors hover:bg-error-500/10"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-600">{label}</span>
      <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 transition-all focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10">
        <span className="text-ink-400">{icon}</span>
        {children}
      </div>
    </label>
  );
}
