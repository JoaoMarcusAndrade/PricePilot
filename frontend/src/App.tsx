import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import LandingPage from '@/pages/LandingPage';
import ChatPage from '@/pages/ChatPage';
import AuthPage from '@/pages/AuthPage';
import AccountPage from '@/pages/AccountPage';

type View = 'landing' | 'chat' | 'auth' | 'account';

function AppInner() {
  const { loading } = useAuth();
  const [view, setView] = useState<View>('landing');

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink-50"><div className="h-9 w-9 animate-pulse rounded-xl bg-brand-600" /></div>;

  // O chat fica liberado nesta versão para facilitar a apresentação antes do backend.
  function openChat() { setView('chat'); }

  switch (view) {
    case 'auth': return <AuthPage onBack={() => setView('landing')} onSuccess={openChat} />;
    case 'chat': return <ChatPage onBack={() => setView('landing')} onAccount={() => setView('account')} />;
    case 'account': return <AccountPage onBack={() => setView('chat')} onSignOut={() => setView('landing')} />;
    default: return <LandingPage onStart={openChat} onAuth={() => setView('auth')} />;
  }
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
