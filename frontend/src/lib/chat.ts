import type { Product, SearchSource } from '@/types';
import { API_URL } from '@/lib/api';
import { toProduct, type BackendOffer } from '@/lib/search';

export type ChatIntent = 'search' | 'conversation' | 'blocked';

type BackendSearch = {
  query: string;
  searchedAt: string;
  offers: BackendOffer[];
  sources: SearchSource[];
  summary: string;
};

type ChatResponse = {
  reply: string;
  intent: ChatIntent;
  search?: BackendSearch;
};

export type SendChatInput = {
  message: string;
  userId?: number | null;
  chatId?: string | null;
};

export async function sendChatMessage(input: SendChatInput): Promise<{
  reply: string;
  intent: ChatIntent;
  products: Product[];
  sources: SearchSource[];
}> {
  const body: Record<string, unknown> = {
    message: input.message,
  };

  if (input.userId) {
    body.userId = input.userId;
  }

  // Only already-saved chats have a numeric id in the backend.
  if (input.chatId && !Number.isNaN(Number(input.chatId))) {
    body.chatId = Number(input.chatId);
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | ChatResponse
    | { error?: string }
    | null;

  if (
    !response.ok ||
    !data ||
    !('intent' in data) ||
    typeof data.reply !== 'string'
  ) {
    throw new Error(
      data && 'error' in data && data.error
        ? data.error
        : 'Não foi possível processar sua mensagem agora.',
    );
  }

  return {
    reply: data.reply,
    intent: data.intent,
    products: data.search?.offers.map((offer, index) =>
      toProduct(offer, index)
    ) ?? [],
    sources: data.search?.sources ?? [],
  };
}