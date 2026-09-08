import type { Request, Response } from "express";
import {
  parseSearchRequest,
  SearchInputError,
  SearchSourceError,
  searchOffers,
} from "../services/search.service.js";

const REQUEST_WINDOW_MS = 60_000;
const MAX_SEARCHES_PER_WINDOW = 6;
const requestTimes = new Map<string, number[]>();

function canSearch(clientId: string): boolean {
  const now = Date.now();
  const recentRequests = (requestTimes.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < REQUEST_WINDOW_MS,
  );

  if (recentRequests.length >= MAX_SEARCHES_PER_WINDOW) {
    requestTimes.set(clientId, recentRequests);
    return false;
  }

  recentRequests.push(now);
  requestTimes.set(clientId, recentRequests);

  return true;
}

export async function search(req: Request, res: Response) {
  if (!canSearch(req.ip || "unknown")) {
    return res.status(429).json({
      error: "Aguarde um minuto antes de fazer novas buscas.",
    });
  }

  try {
    const { query } = parseSearchRequest(req.body);
    const response = await searchOffers(query);

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof SearchInputError) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof SearchSourceError) {
      return res.status(502).json({
        error: "As lojas não responderam à busca agora. Tente novamente em alguns instantes.",
      });
    }

    console.error("Falha ao pesquisar ofertas:", error);

    return res.status(500).json({
      error: "Não foi possível pesquisar ofertas agora.",
    });
  }
}
