import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import AuthLayout from '@/components/AuthLayout';

type Props = { onBack: () => void };
type Mode = 'login' | 'signup';

export default function AuthPage({ onBack }: Props) {
  const [mode, setMode] = useState<Mode>('login');

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <AuthLayout onBack={onBack}>
      {mode === 'login' ? (
        <LoginForm
          onGoogle={signInWithGoogle}
          onToggle={() => setMode('signup')}
        />
      ) : (
        <SignupForm
          onGoogle={signInWithGoogle}
          onToggle={() => setMode('login')}
        />
      )}
    </AuthLayout>
  );
}
