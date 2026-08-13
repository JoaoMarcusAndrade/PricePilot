import { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { useAuth } from '@/lib/auth';

type Props = { onBack: () => void; onSuccess: () => void };
type Mode = 'login' | 'signup';

export default function AuthPage({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const { signIn, signUp, signInWithGoogle } = useAuth();

  return <AuthLayout onBack={onBack}>
    {mode === 'login' ? <LoginForm onSubmit={async (email, password) => { const result = await signIn(email, password); if (!result.error) onSuccess(); return result; }} onGoogle={async () => { await signInWithGoogle(); onSuccess(); }} onToggle={() => setMode('signup')} /> : <SignupForm onSubmit={async (name, email, password) => { const result = await signUp(name, email, password); if (!result.error) onSuccess(); return result; }} onGoogle={async () => { await signInWithGoogle(); onSuccess(); }} onToggle={() => setMode('login')} />}
  </AuthLayout>;
}
