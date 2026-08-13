import type { Chat, Message } from '@/types';

const API_URL = 'http://localhost:3000/api';

type BackendChat = {
  id: number;
  userId: number;
  name: string;
  content: string;
};

type CreateChatData = {
  id?: number;
  name: string;
  content: string;
};

function getUserId(): number | null {
  try {
    const session = localStorage.getItem('pricepilot.session');

    console.log("SESSION:", session)

    if (!session) {
      return null;
    }

    const parsed = JSON.parse(session) as { userId?: number };

    if (!parsed.userId) {
      return null;
    }

    return parsed.userId;
  } catch {
    return null;
  }
}

function backendChatToChat(chat: BackendChat): Chat {
  const now = Date.now();

  let messages: Message[] = [];

  try {
    messages = JSON.parse(chat.content);
  } catch (error) {
    console.error(
      'Erro ao interpretar mensagens do chat:',
      error
    );

    messages = [];
  }

  return {
    id: String(chat.id),
    title: chat.name,
    createdAt: now,
    updatedAt: now,
    messages,
  };
}

export async function loadChats(): Promise<Chat[]> {
  const userId = getUserId();

  if (!userId) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/history/${userId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.error("ERRO DO BACKEND:", errorData);

      throw new Error(
        errorData?.error || "Não foi possível carregar o histórico."
      );
    }

    const data = (await response.json()) as BackendChat[];

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(backendChatToChat);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
}

export async function saveChat(chat: Chat): Promise<BackendChat | null> {
  const userId = getUserId();

  if (!userId) {
    console.error('Usuário não encontrado na sessão.');
    return null;
  }

  const data: CreateChatData = {
    name: chat.title,
    content: JSON.stringify(chat.messages),
  };

  try {
    const response = await fetch(`${API_URL}/history/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.error || 'Não foi possível salvar o histórico.'
      );
    }

    const savedChat = await response.json();

    console.log('CHAT SALVO:', savedChat);

    return savedChat;

  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    return null;
  }
}

export async function updateChat(
  chat: Chat
): Promise<BackendChat | null> {
  const userId = getUserId();

  if (!userId) {
    return null;
  }

  const data = {
    name: chat.title,
    content: JSON.stringify(chat.messages)
  };

  try {
    const response = await fetch(
      `${API_URL}/history/${userId}/${chat.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.error || 'Não foi possível atualizar o histórico.'
      );
    }

    const updatedChat = await response.json();

    console.log('CHAT ATUALIZADO:', updatedChat);

    return updatedChat;

  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
    return null;
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  const userId = getUserId();

  if (!userId) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/history/${userId}/${chatId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.error || 'Não foi possível excluir o chat.'
      );
    }
  } catch (error) {
    console.error('Erro ao excluir chat:', error);
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

  return trimmed.length > 36
    ? trimmed.slice(0, 36) + '…'
    : trimmed || 'Nova busca';
}