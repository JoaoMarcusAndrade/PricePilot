import type { SearchResponse } from "./search.js";

export type ChatKind = "search" | "conversation" | "blocked";

// Structured output produced by the OpenAI call that decides what to do with a message.
export type ChatIntent = {
  kind: ChatKind;
  query: string;
  reply: string;
};

export type ChatResponse = {
  reply: string;
  intent: ChatKind;
  search?: SearchResponse;
};