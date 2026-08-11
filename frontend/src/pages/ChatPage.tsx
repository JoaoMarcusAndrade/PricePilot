import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Clock3, LogOut, Menu, MessageSquare, Plus, Search, Settings, Sparkles, Trash2, X } from 'lucide-react';
import Logo from '@/components/Logo';
import ProductCard from '@/components/ProductCard';
import { buildAssistantReply, searchProducts, SUGGESTIONS } from '@/lib/mockSearch';
import { loadChats, newChat, newMessage, saveChats, titleFromPrompt } from '@/lib/history';
import { useAuth } from '@/lib/auth';
import type { Chat } from '@/types';

type Props = { onBack: () => void; onAccount: () => void };

function renderText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>);
}

function dateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoje';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ChatPage({ onBack, onAccount }: Props) {
  const { user, profile, signOut } = useAuth();
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeId, setActiveId] = useState<string | null>(() => loadChats()[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const activeChat = chats.find(chat => chat.id === activeId) ?? null;

  useEffect(() => { saveChats(chats); }, [chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeChat?.messages.length, isSearching]);

  const groupedChats = useMemo(() => {
    const groups: Record<string, Chat[]> = {};
    chats.forEach(chat => { const key = dateLabel(chat.updatedAt); groups[key] = [...(groups[key] ?? []), chat]; });
    return groups;
  }, [chats]);

  function startNewChat() {
    const chat = newChat();
    setChats(prev => [chat, ...prev]); setActiveId(chat.id); setSidebarOpen(false); setInput('');
  }

  function removeChat(id: string) {
    setChats(prev => prev.filter(chat => chat.id !== id));
    if (activeId === id) setActiveId(chats.find(chat => chat.id !== id)?.id ?? null);
  }

  function submit(prompt = input) {
    const value = prompt.trim();
    if (!value || isSearching) return;
    let chat = activeChat;
    if (!chat) { chat = newChat(); setActiveId(chat.id); }
    const userMessage = newMessage('user', value);
    const nextMessages = [...chat.messages, userMessage];
    setChats(prev => { const exists = prev.some(item => item.id === chat!.id); const updated = { ...chat!, title: chat!.messages.length === 0 ? titleFromPrompt(value) : chat!.title, updatedAt: Date.now(), messages: nextMessages }; return exists ? prev.map(item => item.id === updated.id ? updated : item) : [updated, ...prev]; });
    setInput(''); setIsSearching(true);
    window.setTimeout(() => {
      const products = searchProducts(value);
      const assistantMessage = newMessage('assistant', buildAssistantReply(value, products), { products, status: 'done' });
      setChats(prev => prev.map(item => item.id === chat!.id ? { ...item, updatedAt: Date.now(), messages: [...item.messages, assistantMessage] } : item));
      setIsSearching(false);
    }, 1100);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 flex w-[290px] flex-col border-r border-ink-200 bg-white transition-transform md:relative md:translate-x-0`}>
        <div className="flex h-[73px] items-center justify-between border-b border-ink-100 px-5"><Logo size="sm" /><button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-50 md:hidden"><X size={18} /></button></div>
        <div className="p-4"><button onClick={startNewChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700"><Plus size={17} /> Nova conversa</button></div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-400">Histórico de buscas</p>
          {Object.keys(groupedChats).length === 0 && <div className="px-3 py-8 text-center"><MessageSquare size={28} className="mx-auto text-ink-200" /><p className="mt-3 text-xs leading-relaxed text-ink-400">Suas conversas aparecerão aqui.</p></div>}
          {Object.entries(groupedChats).map(([group, items]) => <div key={group} className="mb-5"><p className="mb-1.5 px-3 text-[11px] font-medium text-ink-400">{group}</p>{items.map(chat => <div key={chat.id} className={`group mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 transition-colors ${activeId === chat.id ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50'}`} onClick={() => { setActiveId(chat.id); setSidebarOpen(false); }}><MessageSquare size={15} className={activeId === chat.id ? 'text-brand-600' : 'text-ink-400'} /><span className="min-w-0 flex-1 truncate text-sm font-medium">{chat.title}</span><button onClick={(e) => { e.stopPropagation(); removeChat(chat.id); }} className="hidden rounded p-1 text-ink-300 hover:bg-white hover:text-error-500 group-hover:block"><Trash2 size={13} /></button></div>)}</div>)}
        </div>
        <div className="border-t border-ink-100 p-4"><button onClick={onAccount} className="flex w-full items-center gap-3 rounded-xl bg-ink-50 p-3 text-left transition-colors hover:bg-ink-100">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">{(profile?.full_name || user?.email || 'VC').charAt(0).toUpperCase()}</div>}<div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-ink-800">{profile?.full_name || 'Minha conta'}</p><p className="truncate text-[10px] text-ink-400">{user?.email}</p></div><Settings size={16} className="text-ink-400" /></button></div>
      </aside>
      {sidebarOpen && <button aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-ink-950/30 md:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-ink-200 bg-white px-4 sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 md:hidden"><Menu size={20} /></button><button onClick={onBack} className="hidden items-center gap-2 rounded-lg p-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800 sm:flex"><ArrowLeft size={17} /> Início</button><div className="h-5 w-px bg-ink-200" /><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-700"><Sparkles size={15} /></div><div><p className="text-sm font-bold text-ink-900">Assistente de compras</p><p className="flex items-center gap-1 text-[10px] text-brand-600"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Pronto para ajudar</p></div></div></div><div className="flex items-center gap-1"><button onClick={onAccount} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800 sm:flex"><Settings size={16} /> Conta</button><button onClick={async () => { await signOut(); onBack(); }} className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-error-500" title="Sair"><LogOut size={18} /></button></div></header>
        <section className="scrollbar-thin flex-1 overflow-y-auto px-4 py-8 sm:px-8"><div className="mx-auto max-w-3xl">
          {!activeChat || activeChat.messages.length === 0 ? <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600 shadow-inner"><Search size={29} /></div><h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">O que você quer comprar?</h1><p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">Eu pesquiso em várias lojas, comparo preços e encontro a melhor opção para você.</p><div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">{SUGGESTIONS.map(suggestion => <button key={suggestion} onClick={() => submit(suggestion)} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm font-medium text-ink-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"><Search size={15} className="text-ink-400" />{suggestion}<ArrowUp size={14} className="ml-auto rotate-45 text-ink-300" /></button>)}</div></div> : <div className="space-y-7">{activeChat.messages.map(message => <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex gap-3'}>{message.role === 'assistant' && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700"><Sparkles size={15} /></div>}<div className={message.role === 'user' ? 'max-w-[82%] rounded-2xl rounded-tr-sm bg-ink-900 px-4 py-3 text-sm leading-relaxed text-white shadow-sm' : 'min-w-0 max-w-[90%] flex-1'}>{message.role === 'assistant' ? <><div className="rounded-2xl rounded-tl-sm border border-ink-200 bg-white px-4 py-3 text-sm leading-7 text-ink-700 shadow-sm">{message.content.split('\n').map((line, i) => <span key={i} className="block">{renderText(line)}{i < message.content.split('\n').length - 1 && <br />}</span>)}</div>{message.products && <div className="mt-3 grid gap-3 sm:grid-cols-2">{message.products.map(product => <ProductCard key={product.id} product={product} />)}</div>}</> : message.content}</div></div>)}{isSearching && <div className="flex gap-3 animate-fade-in"><div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-700"><Sparkles size={15} /></div><div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-ink-200 bg-white px-5 py-4"><span className="h-2 w-2 animate-bounce-dot rounded-full bg-brand-500 [animation-delay:-0.3s]" /><span className="h-2 w-2 animate-bounce-dot rounded-full bg-brand-500 [animation-delay:-0.15s]" /><span className="h-2 w-2 animate-bounce-dot rounded-full bg-brand-500" /></div></div>}<div ref={endRef} /></div>}
        </div></section>
        <div className="border-t border-ink-200 bg-white px-4 py-4 sm:px-8"><div className="mx-auto max-w-3xl"><form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-ink-50 p-2 transition-all focus-within:border-brand-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-500/10"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={1} placeholder="Digite o produto que você está procurando..." className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink-800 outline-none placeholder:text-ink-400" /><button type="submit" disabled={!input.trim() || isSearching} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200"><ArrowUp size={18} /></button></form><p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-ink-400"><Clock3 size={11} /> As ofertas são simuladas nesta demonstração</p></div></div>
      </main>
    </div>
  );
}
