import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import LandingPage from '@/pages/LandingPage';
import ChatPage from '@/pages/ChatPage';
import AuthPage from '@/pages/AuthPage';
import AccountPage from '@/pages/AccountPage';

type View = 'landing' | 'chat' | 'auth' | 'account';

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-brand-600" />
          <p className="text-sm text-ink-400">Carregando…</p>
        </div>
      </div>
    );
  }

  function handleStart() {
    setView(user ? 'chat' : 'auth');
  }

  switch (view) {
    case 'auth':
      return <AuthPage onBack={() => setView('landing')} />;
    case 'chat':
      return <ChatPage onBack={() => setView('landing')} onAccount={() => setView('account')} />;
    case 'account':
      return (
        <AccountPage
          onBack={() => setView('chat')}
          onSignOut={() => setView('landing')}
        />
      );
    default:
      return <LandingPage onStart={handleStart} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
