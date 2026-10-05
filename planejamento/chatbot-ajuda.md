# Chatbot Híbrido — Módulo de Ajuda DashiDrive

## Visão Geral

Chatbot inteligente confinado ao módulo de ajuda (`src/pages/ajuda/`). Combina busca local em knowledge base com IA generativa via OpenRouter, permitindo trocar o modelo sem deploy.

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Proxy IA | OpenRouter | Qualquer modelo (GPT, Claude, Gemini, Llama, Mistral...), API compatível com OpenAI |
| Orquestração | Supabase Edge Function | Proxy seguro, lê config do DB, chama OpenRouter |
| Configuração | `feature_flags` + coluna `metadata` JSONB | Dev gerencia modelo, prompt, temperatura via `/dev/chatbot` |
| Conhecimento | `src/lib/ajuda-knowledge-base.ts` | Índice estático extraído das 42 páginas de ajuda |
| Histórico | Nova tabela `chatbot_conversations` | Persiste mensagens por sessão |
| Frontend | React + Tailwind + shadcn/ui + Radix Dialog | Padrão do projeto |
| Estado | TanStack React Query | Mutations e queries consistentes |

## Arquitetura de Configuração

Em vez de variáveis `.env` (exceto a chave secreta da OpenRouter), usamos a tabela `feature_flags` já existente, adicionando uma coluna `metadata` JSONB:

```
feature_flags
 ├── key = 'chatbot'
 ├── enabled = true/false
 └── metadata = {
       "model": "openai/gpt-4o",
       "model_fallback": "openai/gpt-4o-mini",
       "system_prompt": "Você é o assistente de ajuda da DashiDrive...",
       "max_tokens": 1024,
       "temperature": 0.7,
       "max_history_messages": 10,
       "knowledge_search_enabled": true
     }
```

O dev gerencia tudo via página dedicada em `/dev/chatbot`.

## Fluxo de Dados

```
── Dev configura ──────────────────────────────────────────
  /dev/chatbot → formulário → salva em feature_flags (row 'chatbot')

── Usuário interage ───────────────────────────────────────
  Usuário digita pergunta
    → ChatbotPanel (componente React)
    → searchKnowledgeBase(query) [local, sem API]
        ↓
    → Edge Function chatbot-query
        ↓
    → Lê config do feature_flags (model, prompt, temperatura...)
        ↓
    → Monta system prompt + contexto das páginas relevantes
        ↓
    → POST OpenRouter (model = config.model)
        ↓
    → Retorna { response, suggestedPages[] }
        ↓
    → Exibe resposta + links → salva em chatbot_conversations
```

### Fallback offline
Se a Edge Function falhar (rede, OpenRouter fora, etc.), o chatbot responde com:
> "Encontrei estas páginas que podem te ajudar:" + links sugeridos pelo `searchKnowledgeBase()`
Isso garante que o chatbot nunca fique mudo.

## Knowledge Base Local

Arquivo: `src/lib/ajuda-knowledge-base.ts`

```typescript
interface AjudaEntry {
  route: string;           // "/ajuda/gestao/veiculos"
  module: string;          // "gestao" | "lojista" | "marketplace" | "motorista"
  title: string;           // "Veículos"
  description: string;     // Texto da Visão Geral
  steps: { title: string; description: string }[];  // Passo a Passo
  tips: string[];          // Dicas Importantes
  keywords: string[];      // Extraídas dos títulos, descrições e steps
}

export function searchKB(query: string, topK?: number): AjudaEntry[];
export function getContextForRoutes(routes: string[]): string;
```

Conteúdo extraído manualmente de cada uma das 42 páginas em `src/pages/ajuda/{gestao,lojista,marketplace,motorista}/`.

## Estrutura de Arquivos

### Criar (8)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `supabase/migrations/comuns/20260624000002_add_feature_flags_metadata.sql` | `ALTER TABLE feature_flags ADD COLUMN metadata JSONB` + seed da row `chatbot` |
| 2 | `src/lib/ajuda-knowledge-base.ts` | Índice pesquisável das 42 páginas de ajuda |
| 3 | `supabase/functions/chatbot-query/index.ts` | Edge Function que lê config, monta contexto, chama OpenRouter |
| 4 | `src/integrations/supabase/services/chatbotService.ts` | Service: getConfig, sendMessage, getHistory, saveMessage |
| 5 | `src/hooks/useChatbot.ts` | Hooks TanStack Query: config, sessão, envio |
| 6 | `src/components/ajuda/chatbot/ChatbotButton.tsx` | Botão flutuante (canto inferior direito, estilo neu) |
| 7 | `src/components/ajuda/chatbot/ChatbotPanel.tsx` | Painel de chat com bolhas, input, suggested pages, typing indicator |
| 8 | `src/pages/dev/Chatbot.tsx` | Formulário dev: modelo, fallback, system prompt, temperatura, tokens, enable |

### Modificar (5)

| # | Arquivo | Mudança |
|---|---------|---------|
| 9 | `src/layouts/ajuda/AjudaLayout.tsx` | Adicionar `<ChatbotButton />` |
| 10 | `src/integrations/supabase/types.ts` | Adicionar tipagem da coluna `metadata` em `feature_flags` |
| 11 | `src/App.tsx` | Import `DevChatbot` + rota `<Route path="chatbot" ...>` |
| 12 | `src/components/dev/DevSidebar.tsx` | Item `{ name: "Chatbot", path: "/dev/chatbot", icon: Bot }` |
| 13 | `src/hooks/dev/useFeatureFlags.ts` | Adicionar `metadata` ao type `FeatureFlag` e ao select |

### Observações sobre modificações

- **Não** incluir no menu mobile (`DevMobileBottomNav.tsx`) — solicitado explicitamente
- `VITE_OPENROUTER_API_KEY` continua no `.env` por segurança (não vai pro DB)
- A knowledge base NÃO modifica nenhuma página de ajuda existente — é um arquivo novo que duplica o conteúdo em formato indexável

## Dependências já existentes no projeto

| Pacote | Uso |
|--------|-----|
| `@radix-ui/react-dialog` | Painel do chat (já usado em `dialog.tsx`) |
| `@tanstack/react-query` | Hooks e mutations |
| `lucide-react` | Ícones (Bot, Send, Loader2, MessageCircle...) |
| `@supabase/supabase-js` | Client + `functions.invoke` |
| `sonner` | Toasts de erro/sucesso |
| `tailwindcss` + `cn()` | Estilização |
| `framer-motion` | Animações das bolhas (já incluso) |

## Ordem de Implementação

1. Migration da tabela `feature_flags` + seed
2. Knowledge base (`ajuda-knowledge-base.ts`)
3. Tipos (`types.ts` + `useFeatureFlags.ts`)
4. Edge Function (`chatbot-query/index.ts`)
5. Service (`chatbotService.ts`)
6. Hook (`useChatbot.ts`)
7. Componentes (`ChatbotButton` + `ChatbotPanel`)
8. Página dev (`/dev/chatbot`)
9. Integração no layout (`AjudaLayout.tsx`)
10. Rotas + sidebar (`App.tsx` + `DevSidebar.tsx`)
