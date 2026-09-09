import type { Request, Response } from "express";
import {
  ChatApiKeyMissingError,
  ChatForbiddenError,
  ChatInputError,
  ChatUpstreamError,
  handleChat,
  isUpstreamError,
  parseChatRequest,
} from "../services/chat.service.js";
import { SearchSourceError } from "../services/search.service.js";

const REQUEST_WINDOW_MS = 60_000;
const maxRequestsPerWindow = Number(
  process.env.CHAT_MAX_REQUESTS_PER_MINUTE ?? 10,
);
const requestTimes = new Map<string, number[]>();

function canChat(clientId: string): boolean {
  const now = Date.now();
  const recentRequests = (requestTimes.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < REQUEST_WINDOW_MS,
  );

  if (recentRequests.length >= maxRequestsPerWindow) {
    requestTimes.set(clientId, recentRequests);
    return false;
  }

  recentRequests.push(now);
  requestTimes.set(clientId, recentRequests);

  return true;
}

export async function chat(req: Request, res: Response) {
  // AI calls have a cost, so limit requests per client before doing any work.
  if (!canChat(req.ip || "unknown")) {
    return res.status(429).json({
      error: "Muitas mensagens em pouco tempo. Aguarde um instante e tente de novo.",
    });
  }

  try {
    const body = parseChatRequest(req.body);
    const response = await handleChat(body);

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ChatInputError) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof ChatApiKeyMissingError) {
      return res.status(503).json({ error: error.message });
    }

    if (error instanceof ChatForbiddenError) {
      return res.status(404).json({ error: error.message });
    }

    if (error instanceof SearchSourceError) {
      return res.status(502).json({
        error: "As lojas não responderam à busca agora. Tente novamente em alguns instantes.",
      });
    }

    if (error instanceof ChatUpstreamError || isUpstreamError(error)) {
      return res.status(502).json({
        error: "O assistente de IA não respondeu agora. Tente novamente em alguns instantes.",
      });
    }

    console.error("Falha ao processar o chat:", error);

    return res.status(500).json({
      error: "Não foi possível processar sua mensagem agora.",
    });
  }
}