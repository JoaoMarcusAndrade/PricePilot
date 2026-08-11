# The Last Tango DDM

SaaS de pesquisa de preço com IA para e-commerce e compras internacionais.

## Visão geral

Entre o usuário e as APIs das lojas há uma camada de inteligência artificial que:

- coleta dados de preços, frete e prazos das APIs;
- normaliza resultados para facilitar a decisão do cliente;
- compara ofertas automaticamente;
- responde o usuário de forma humanizada

## Funcionalidades principais

- Comparação de preços entre múltiplas lojas
- Recomendação da melhor opção de compra
- Conversão de moeda automática
- Cálculo de impostos e taxas para importações
- Comparação e recomendação feita por IA
- Arquitetura monorepo com backend e frontend integrados

## Stack

- TypeScript
- Node.js
- Express
- React
- Vite
- type: module
- Monorepo
- MVC

## Como usar

1. Clone o repositório
2. Execute `npm install`
3. Inicie em modo de desenvolvimento com `npm run dev`

## Estrutura sugerida

- `packages/backend` - API Express e lógica de regra de negócios
- `packages/frontend` - interface React + Vite
- `packages/common` - tipos e utilitários compartilhados

## Objetivo

Ajudar o cliente a tomar a melhor decisão de compra usando inteligência artificial para comparar preços, câmbio e impostos de forma clara e prática.