import type { Chat, Message } from '@/types';

const KEY = 'pricepilot.chats.v1';

export function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats));
  } catch {
    /* ignore quota errors */
  }
}

export function newChat(): Chat {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: 'Nova busca',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function newMessage(
  role: 'user' | 'assistant',
  content: string,
  extra: Partial<Message> = {}
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...extra,
  };
}

export function titleFromPrompt(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  return trimmed.length > 36 ? trimmed.slice(0, 36) + '…' : trimmed || 'Nova busca';
}
