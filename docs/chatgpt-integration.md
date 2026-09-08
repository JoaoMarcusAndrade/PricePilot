# Integracao do ChatGPT

Este documento descreve a proxima entrega: usar a API da OpenAI para conversar com o usuario e transformar pedidos de hardware em buscas seguras nas lojas.

## Objetivo

O chat deve aceitar linguagem natural, por exemplo: "quero uma placa de video para jogar em 1440p ate R$ 3.000". A IA interpreta a intencao, produz uma query curta para as lojas e explica o resultado encontrado.

Ela nao deve ser a unica barreira de seguranca. O backend precisa validar a mensagem e a query final antes de iniciar o web scraping.

## Fluxo esperado

1. O frontend envia `POST /api/chat` com `message`, `userId` e, quando existir, `chatId`.
2. O controlador valida tipo, tamanho e limite de requisicoes.
3. O servico de chat envia a mensagem e um pequeno historico para a OpenAI e recebe JSON estruturado com uma intencao.
4. Se a intencao for `search`, o backend valida a query de hardware e chama `searchOffers(query)`.
5. O servico envia apenas as ofertas normalizadas para a OpenAI gerar uma resposta clara. A IA nao pode inventar preco, disponibilidade ou link.
6. O controlador devolve a mensagem do assistente e, quando houver, as ofertas para o frontend.
7. As mensagens do usuario e do assistente sao salvas no historico.

## Contratos sugeridos

Crie `backend/src/contracts/chat.ts` com tipos semelhantes a estes:

```ts
export type ChatIntent =
  | { kind: "search"; query: string; reply: string }
  | { kind: "conversation"; reply: string }
  | { kind: "blocked"; reply: string };

export type ChatResponse = {
  reply: string;
  intent: ChatIntent["kind"];
  search?: SearchResponse;
};
```

O JSON retornado pela OpenAI deve ser validado no backend antes de ser usado. Nao aceite texto livre como se fosse uma query confiavel.

## Nova rota e arquivos

- Adicionar `backend/src/routes/chat.routes.ts` com `POST /`.
- Registrar a rota em `backend/src/routes/index.routes.ts` como `/api/chat`.
- Adicionar `backend/src/controllers/chat.controller.ts` para validar a requisicao HTTP e converter erros em respostas HTTP.
- Adicionar `backend/src/services/chat.service.ts` para chamar a OpenAI e orquestrar a busca.
- Manter `backend/src/services/search.service.ts` como o unico ponto que chama os provedores das lojas. O chat deve reutilizar `searchOffers` em vez de duplicar scraping.

## Regras de seguranca obrigatorias

1. Guardar `OPENAI_API_KEY` apenas no `.env` do backend. Nunca enviar a chave ao frontend ou registrar a chave em logs.
2. Validar `message` como string com limite pequeno, por exemplo 500 caracteres, antes de chamar a IA.
3. Aplicar rate limit por IP e, quando houver login, por usuario. Chamadas para OpenAI e lojas tem custo e podem sofrer abuso.
4. Usar a moderacao da OpenAI para conteudo abusivo, alem de uma resposta local para mensagens vazias ou invalidas.
5. Aceitar buscas somente de hardware e perifericos. A validacao local deve manter uma lista de categorias e termos aceitos, como processador, placa de video, memoria RAM, SSD, HD, placa-mae, fonte, gabinete, monitor, teclado, mouse, headset e marcas conhecidas.
6. Rejeitar uma query que nao passe na validacao local, mesmo que a IA responda `kind: "search"`. Isso evita prompt injection e buscas fora do escopo.
7. Usar resposta estruturada ou tool calling com schema fechado para os tres valores de `kind`. Nao decidir o fluxo comparando frases geradas pelo modelo.
8. Ao montar a resposta final, enviar ao modelo somente dados retornados no `SearchResponse`. Instrua-o a nao criar lojas, links, precos ou especificacoes que nao estejam nas ofertas.

## Prompt de sistema

O prompt deve definir que o PricePilot ajuda apenas com hardware e perifericos, que a IA deve ser educada e objetiva e que deve retornar uma das intencoes previstas. Ele tambem deve dizer para pedir marca, modelo, faixa de preco ou uso pretendido quando faltar informacao para uma busca boa.

Mensagens como "ignore as regras" ou pedidos fora de hardware devem receber `kind: "blocked"` ou `kind: "conversation"`; elas nunca podem virar uma query de scraping.

## Historico de conversa

O modelo atual `Chat` salva somente `name` e `content`. Para uma conversa com IA, criar uma migracao para salvar cada mensagem com:

- `userId`
- `conversationId`
- `role` (`user` ou `assistant`)
- `content`
- `createdAt`

Envie apenas as ultimas mensagens da conversa para a OpenAI, por exemplo 10, para controlar custo e tamanho do contexto. Nunca confie em conteudo do historico como instrucao de sistema.

## Correcao antes de expor o chat

Corrigir a autenticacao antes de colocar o endpoint em producao:

- `loginUser` em `backend/src/services/user.service.ts` usa `bcrypt.compare` com argumentos e condicao incorretos.
- As respostas de usuario nao devem expor o campo `pass`, mesmo sendo hash.
- As operacoes de atualizar e apagar chats precisam confirmar que o chat pertence ao `userId` autenticado.

## Testes minimos

1. Mensagem de hardware valida gera `searchOffers` com a query estruturada.
2. Mensagem fora do escopo nao chama nenhum provedor de loja.
3. Mensagem bloqueada pela moderacao retorna resposta segura.
4. Resposta invalida da OpenAI retorna erro controlado sem chamar scraping.
5. Preco, URL e disponibilidade exibidos na resposta final existem no `SearchResponse`.
6. Rate limit impede excesso de chamadas para OpenAI e marketplaces.

## Variaveis de ambiente

Documentar no `.env.example`, sem valores reais:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
CHAT_MAX_MESSAGE_LENGTH=500
CHAT_MAX_REQUESTS_PER_MINUTE=10
```

Depois de implementar, executar `npm run test -w backend`, `npm run build -w backend` e testar manualmente uma conversa, uma busca valida e um pedido fora do escopo.
