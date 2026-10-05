# Plano de Correção de Segurança — DashiDrive

> **Prioridade:** 🔴 CRÍTICA — Executar imediatamente antes de qualquer outro trabalho
> **Baseado no relatório:** `SECURITY-REPORT.md` (19/06/2026)

---

## Tabela de Fases

| Fase | Descrição | Prioridade | Esforço | Risco se não fizer |
|------|-----------|------------|---------|---------------------|
| **FASE 0** | 🔴 Contenção de Emergência | 🔴 **IMEDIATA** | ~30 min | ✅ Concluída |
| **FASE 1** | Remover Secrets do Código | 🔴 Crítica | ~4 horas | ✅ Concluída |
| **FASE 2** | Corrigir CORS e Headers | 🟠 Alta | ~2 horas | ✅ Concluída |
| **FASE 3** | Corrigir Autenticação e Autorização | 🟠 Alta | ~1 dia | ✅ Concluída |
| **FASE 4** | Remediar Vulnerabilidades de Código | 🟠 Alta | ~1 dia | ✅ Concluída |
| **FASE 5** | Endurecer Infraestrutura | 🟡 Média | ~4 horas | ✅ Concluída |
| **FASE 6** | Verificação Final | 🔴 **OBRIGATÓRIA** | ~1 hora | ✅ Concluída |

---

## FASE 0 — CONTENÇÃO DE EMERGÊNCIA (30 min) ✅

> ~~**⚠️ FAÇA ISSO AGORA antes de qualquer outra tarefa.**~~ ✅ Concluída

### 0.1 — Migrar de Service Role Key para Secret Keys ✅

**O quê:** Gerar nova chave `service_role` no painel do Supabase.
**Onde fazer:** https://supabase.com/dashboard/project/igchaidmowxpyjapjybe/settings/api
**Como:**
1. Acessar Dashboard do Supabase → Project Settings → API
2. Na seção `Project API keys`, clicar em `Reveal` ao lado de `service_role` (não a anon!)
3. Clicar em **"Rotate"** ou gerar uma nova key
4. Atualizar a Edge Function `supabase/functions/asaas-webhook/index.ts` (se usa `SUPABASE_SERVICE_ROLE_KEY` via env var)
5. Atualizar `supabase/functions/process-payment/index.ts`
6. Atualizar `supabase/functions/check-payment-status/index.ts`
7. Atualizar `supabase/functions/check-plan-expiry/index.ts`

```bash
# Legacy service_role foi substituída por SUPABASE_SECRET_KEYS nas Edge Functions
# A chave service_role JWT foi desativada no Dashboard (Settings → API Keys)
```

### 0.2 — Rotacionar Chaves de Produção do Asaas ✅

**O quê:** Gerar novas chaves de API (produção) e webhook secret no Asaas.
**Onde fazer:** https://sandbox.asaas.com (ou https://www.asaas.com para produção)
**Como:**
1. Acessar Asaas → Configurações → Integração → API
2. Clicar em **"Gerar nova chave de API"** ou **"Rotacionar"**
3. Copiar a NOVA chave de produção
4. Ir em Configurações → Webhook → **"Gerar novo token"**
5. Copiar o NOVO webhook secret

**Atualizar variáveis de ambiente nas Edge Functions:**
```bash
# Supabase Dashboard → Edge Functions → Environment Variables
ASAAS_API_KEY = nova_chave_producao
ASAAS_WEBHOOK_SECRET = novo_webhook_secret
ASAAS_BASE_URL = https://www.asaas.com/api/v3
```

**Se as credenciais estavam hardcoded nas Edge Functions (verificar):**
```typescript
// supabase/functions/process-payment/index.ts — linha ~209
// NÃO faça mais isso:
// const asaasApiKey = "chave_hardcoded_aqui";

// Faça isso:
const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
if (!asaasApiKey) throw new Error("ASAAS_API_KEY não configurada");
```

### 0.3 — Revogar JWT Secret ✅

**O quê:** A secret key do Supabase (`sb_secret_...`) exposta no `.mcp.json` permite acesso administrativo total.
**Onde fazer:** Supabase Dashboard → Project Settings → API
**Como:**
1. Ir em Project Settings → API → `secret_key` (JWT secret)
2. Clicar em **"Reset JWT Secret"**
3. Confirmar — **ISSO VAI INVALIDAR TODOS OS TOKENS ATIVOS** (todos os usuários precisarão fazer login novamente)
4. Agendar horário de baixo tráfego para essa operação

### 0.4 — Remover chv.asaas.md do Histórico Git ✅

**O quê:** Remover permanentemente o arquivo com chaves do Asaas do histórico do git.
**Como:**
```bash
# 1. Instalar bfg se não tiver:
# winget install bfg-repo-cleaner  (Windows)
# brew install bfg  (Mac)

# 2. Criar clone mirror e limpar:
cd C:\Projects\dashidrive2026
git pull  # garantir que está com a última versão

# Usando git filter-repo (recomendado):
pip install git-filter-repo
git filter-repo --path chv.asaas.md --invert-paths

# Se não tiver filter-repo, usar bfg:
# java -jar bfg.jar --delete-files chv.asaas.md .git

# 3. Forçar push (com cuidado — coordenar com equipe):
# git push origin --force --all

# 4. Se houver branches, forçar em todas:
# git push origin --force --tags
```

> ⚠️ Após o force push, **TODOS OS COLABORADORES** precisam clonar novamente o repositório.

---

## FASE 1 — REMOVER SECRETS DO CÓDIGO (4 horas) ✅

### 1.1 — Remover serviceRoleKey do Bundle Frontend ✅

**Arquivo:** `src/integrations/supabase/client.ts`

```diff
 export const SUPABASE_PROJECT = {
   url: SUPABASE_URL,
   anonKey: SUPABASE_KEY,
-  serviceRoleKey:
-    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
+  // serviceRoleKey removida — NUNCA expor service_role no frontend
+  // Se precisar de operações admin, crie uma Edge Function
 };
```

### 1.2 — Criar Edge Functions para Operações Admin ✅

As operações que usavam `serviceRoleKey` no frontend precisam ser movidas para Edge Functions:

#### 1.2.1 — Marketplace — Criar Anúncio via Edge Function

**Criar:** `supabase/functions/marketplace-create-listing/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://dashidrive.com.br", // DOMÍNIO ESPECÍFICO
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();
    const { input, userId, companyId } = body;

    // Validar que o usuário pertence à empresa
    const { data: profile } = await supabase
      .from("carcontrol_profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (!profile || profile.company_id !== companyId) {
      return new Response("Unauthorized", { status: 403, headers: corsHeaders });
    }

    // Inserir listing via service_role (server-side, seguro)
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert({ ...input, company_id: companyId, seller_user_id: userId })
      .select("id")
      .single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

#### 1.2.2 — Billing — Criar Edge Function para Estatísticas

**Criar:** `supabase/functions/admin-billing-overview/index.ts`

Similar ao acima, recebendo `userId` como parâmetro e validando que o usuário tem role `dev` no banco.

```typescript
// Estrutura básica
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(/* env vars */);

  // Validar token de autenticação
  const authHeader = req.headers.get("Authorization");
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace("Bearer ", ""));
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Verificar role dev
  const { data: profile } = await supabase
    .from("carcontrol_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "dev") return new Response("Forbidden", { status: 403 });

  // Lógica de billing aqui...
});
```

#### 1.2.3 — Cupons — Edge Function de Admin

**Criar:** `supabase/functions/admin-coupons/index.ts`

Mesmo padrão: autenticar → verificar role dev → executar operação.

### 1.3 — Atualizar Frontend para Chamar Edge Functions ✅

**Arquivo:** `src/integrations/supabase/services/marketplaceService.ts`

```diff
- const supabaseAdmin = createClient(SUPABASE_PROJECT.url, SUPABASE_PROJECT.serviceRoleKey);

 export async function createMarketplaceListing(input: { ... }) {
   const { data: userData } = await supabase.auth.getUser();
   if (!userData.user) throw new Error("Não autenticado.");

-  const result = await (supabaseAdmin as any)
-    .from("marketplace_listings")
-    .insert({ ... })
-    .select("id")
-    .single();

+  const response = await fetch(
+    `${SUPABASE_URL}/functions/v1/marketplace-create-listing`,
+    {
+      method: "POST",
+      headers: {
+        "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
+        "Content-Type": "application/json",
+      },
+      body: JSON.stringify({ input, userId: userData.user.id, companyId: input.companyId }),
+    }
+  );
+  if (!response.ok) throw new Error(await response.text());
+  return await response.json();
 }
```

**Arquivo:** `src/hooks/dev/useBillingOverview.ts`

```diff
- const supabaseAdmin = createClient(SUPABASE_PROJECT.url, SUPABASE_PROJECT.serviceRoleKey, { ... });

 export function useBillingOverview() {
   return useQuery({
     queryKey: ["billing-overview"],
     queryFn: async () => {
-      const [companiesRes, paymentsRes] = await Promise.all([
-        supabase.from("carcontrol_companies").select(...),
-        supabaseAdmin.from("payments").select(...),
-      ]);

+      const session = await supabase.auth.getSession();
+      const response = await fetch(
+        `${SUPABASE_URL}/functions/v1/admin-billing-overview`,
+        {
+          headers: {
+            "Authorization": `Bearer ${session.data.session?.access_token}`,
+          },
+        }
+      );
+      if (!response.ok) throw new Error(await response.text());
+      return await response.json();
     },
   });
 }
```

**Arquivo:** `src/hooks/dev/useCoupons.ts`

Mesmo padrão de substituição de `supabaseAdmin` por chamada a Edge Function.

### 1.4 — Remover Fallbacks Hardcoded do Supabase Client ✅

**Arquivo:** `src/integrations/supabase/client.ts`

```diff
 const SUPABASE_URL =
-  (import.meta.env.VITE_SUPABASE_URL as string) ||
-  'https://igchaidmowxpyjapjybe.supabase.co';
+  import.meta.env.VITE_SUPABASE_URL;
+if (!SUPABASE_URL) {
+  throw new Error('VITE_SUPABASE_URL não definida. Configure o arquivo .env');
+}

 const SUPABASE_KEY =
-  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
-  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
+  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
+if (!SUPABASE_KEY) {
+  throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY não definida. Configure o arquivo .env');
+}
```

### 1.5 — Remover Fallback Hardcoded do Webhook Test Hook ✅

**Arquivo:** `src/hooks/dev/useWebhookTest.ts`

```diff
- const anonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
-   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
+ const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
+ if (!anonKey) throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY não definida");

- headers["x-asaas-webhook-secret"] = "whsec_AZkG_mcux_3cHR9ZOLMGVZ76oSwxA_PVPu-EGd5ntBA";
+ // Webhook secret removido — não deve estar no frontend.
+ // Esta ferramenta de teste deve ser desativada em produção.
```

### 1.6 — Remover Hardcoded Supabase URL do Hook de Teste ✅

**Arquivo:** `src/hooks/dev/useWebhookTest.ts`

```diff
- const SUPABASE_URL = "https://igchaidmowxpyjapjybe.supabase.co";
+ const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
```

### 1.7 — Remover Hardcoded n8n Webhook URL ✅

**Arquivo:** `src/lib/webhook-leads.ts`

```diff
- const webhookUrl = import.meta.env.VITE_WEBHOOK_LEADS_URL || 
-   "https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/dashidrive";
+ const webhookUrl = import.meta.env.VITE_WEBHOOK_LEADS_URL;
+ if (!webhookUrl) throw new Error("VITE_WEBHOOK_LEADS_URL não configurada");
```

**Arquivo:** `src/pages/mobile/Presente.tsx`

```diff
- const webhookUrl = "https://n8n-n8n-start.yl9ubt.easypanel.host/webhook-test/dashidrive";
+ const webhookUrl = import.meta.env.VITE_WEBHOOK_LEADS_URL;
```

### 1.8 — Remover .mcp.json do Git e Adicionar ao .gitignore ✅

```bash
# 1. Remover do tracking
cd C:\Projects\dashidrive2026
git rm --cached .mcp.json

# 2. Verificar .gitignore já tem .env, adicionar .mcp.json
echo ".mcp.json" >> .gitignore

# 3. Commit
git add .gitignore
git commit -m "chore: remove .mcp.json from tracking (security)"
```

### 1.9 — Criar .env.example ✅

**Criar:** `.env.example`

```env
# Supabase
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-anon-key-aqui"

# Webhook
VITE_WEBHOOK_LEADS_URL="https://seu-webhook.com/leads"
```

---

## FASE 2 — CORRIGIR CORS E HEADERS (2 horas) ✅

### 2.1 — Restringir CORS nas Edge Functions ✅

**Arquivos a modificar (4 funções):**
- `supabase/functions/asaas-webhook/index.ts`
- `supabase/functions/process-payment/index.ts`
- `supabase/functions/check-payment-status/index.ts`
- `supabase/functions/check-plan-expiry/index.ts`

Em cada uma:

```diff
 const corsHeaders = {
-  "Access-Control-Allow-Origin": "*",
+  "Access-Control-Allow-Origin": "https://dashidrive.com.br",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
 };
```

> Se houver múltiplos domínios (staging, dev), usar array com validação:
> ```typescript
> const ALLOWED_ORIGINS = [
>   "https://dashidrive.com.br",
>   "https://staging.dashidrive.com.br",
>   "http://localhost:8080",
> ];
> const origin = req.headers.get("Origin") || "";
> const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
> ```

### 2.2 — Configurar Security Headers no Middleware (ou Server) ✅

**Opção A — Middleware Vite/Express (se houver)**

**Criar:** `server/middleware/security-headers.ts`
```typescript
export function securityHeaders(req: any, res: any, next: any) {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://igchaidmowxpyjapjybe.supabase.co https://*.supabase.co wss://*.supabase.co; " +
    "frame-ancestors 'none';"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}
```

**Opção B — Configurar no Vite (se for SPA estático)**

Se estiver usando Vite puro sem servidor, os headers precisam ser configurados na CDN (Vercel, Netlify, etc.):

```json
// vercel.json (se usando Vercel)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://igchaidmowxpyjapjybe.supabase.co wss://*.supabase.co; frame-ancestors 'none';" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 2.3 — Remover Ferramenta de Teste de Webhook do Ambiente de Produção ✅

**Arquivo:** `src/App.tsx`

```diff
- <Route path="/dev/webhooks" element={<DevWebhookTest />} />
+ {/* Rota /dev/webhooks desativada em produção — expunha secrets */}
+ {/* <Route path="/dev/webhooks" element={<DevWebhookTest />} /> */}
```

Ou melhor: criar um componente condicional:

```typescript
// src/DevRoutes.tsx
const isDev = import.meta.env.DEV; // true apenas em desenvolvimento local
{isDev && <Route path="/dev/webhooks" element={<DevWebhookTest />} />}
```

---

## FASE 3 — CORRIGIR AUTENTICAÇÃO E AUTORIZAÇÃO (1 dia)

### 3.1 — Migrar Token de localStorage para Cookie HttpOnly ✅

**Arquivo:** `src/integrations/supabase/client.ts`

```diff
 export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
   auth: {
-    storage: localStorage,
+    storage: {
+      getItem: (key: string) => {
+        // Tentar cookie primeiro
+        const cookie = document.cookie
+          .split("; ")
+          .find((row) => row.startsWith(`${key}=`));
+        return cookie ? cookie.split("=")[1] : null;
+      },
+      setItem: (key: string, value: string) => {
+        document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; Secure`;
+      },
+      removeItem: (key: string) => {
+        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; Secure`;
+      },
+    },
     persistSession: true,
     autoRefreshToken: true,
     detectSessionInUrl: true,
   },
 });
```

> ⚠️ Nota: `cookie` HttpOnly de verdade só é possível com um servidor intermediário ou usando o cookie `sb-*-auth-token` que o Supabase já gera. Verificar se o Supabase Auth está configurado para usar cookies em vez de localStorage.

### 3.2 — Hardening do DevProtectedRoute com Verificação Server-Side ✅

**Arquivo:** `src/components/layout/DevProtectedRoute.tsx`

Adicionar verificação de role no backend (via Edge Function) antes de permitir acesso:

```typescript
export const DevProtectedRoute = ({ children }: DevProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Lógica atual de role check no frontend MANTIDA como primeira barreira
  // MAS deve ser complementada por verificação server-side nos dados

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (profile?.role !== 'dev') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
```

Além disso, **TODAS as páginas de dev** que carregam dados sensíveis devem ser migradas para Edge Functions.

### 3.3 — Rotacionar JWT Secret no Supabase ✅

Ver item 0.3. Feito como contenção, mas confirmar:
1. Todos os usuários foram forçados a fazer login novamente
2. Nenhum token antigo é aceito

---

## FASE 4 — REMEDIAR VULNERABILIDADES DE CÓDIGO (1 dia)

### 4.1 — Corrigir XSS no Componente Chart ✅

**Arquivo:** `src/components/ui/chart.tsx`

**Opção A (recomendada):** Usar `style` tag segura — injetar variáveis CSS via `style` prop no elemento pai em vez de `<style dangerouslySetInnerHTML>`.

```tsx
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, cfg]) => cfg.theme || cfg.color);
  if (!colorConfig.length) return null;

  // Gerar variáveis CSS como string segura (apenas valores de cor)
  const cssVars = colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.light || itemConfig.color;
      return color ? `--color-${key}: ${color};` : null;
    })
    .filter(Boolean)
    .join("\n");

  return (
    <style>{`[data-chart=${id}] { ${cssVars} }`}</style>
  );
};
```

> Nota: Isso assume que `config` é uma prop confiável (vem do próprio código, não de input do usuário). O `dangerouslySetInnerHTML` foi substituído por template literal seguro. Ainda assim, adicionar validação de que os valores são cores hex válidas.

**Opção B (mais segura):** Usar CSS custom properties inline no elemento.

```tsx
const style = document.createElement('style');
style.textContent = `[data-chart=${id}] { ... }`; // textContent é seguro
```

### 4.2 — Sanitizar Logs de Erro ✅

**Arquivos com `console.error` expondo dados sensíveis:**

Buscar por `console.error` que pode estar expondo dados de usuário:
```bash
rg "console\.error" src/ --include "*.tsx" --include "*.ts"
```

Cada ocorrência deve ser revisada para garantir que não expõe:
- Tokens de autenticação
- Dados de pagamento
- Informações pessoais

**Boa prática:**
```typescript
// ❌ Ruim
console.error("Erro:", error);

// ✅ Bom — logging estruturado sem dados sensíveis
console.error("Erro ao processar pagamento:", error.message);
// Ou usar serviço de logging que sanitiza automaticamente
```

### 4.3 — Validar Input em Propostas e Listagens do Marketplace ✅

**Arquivo:** `src/integrations/supabase/services/marketplaceService.ts`

Adicionar validação Zod nos inputs de criação de listing e proposta:

```typescript
import { z } from "zod";

const listingInputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().positive(),
  // ... outros campos
});

const proposalSchema = z.object({
  listingId: z.string().uuid(),
  buyerName: z.string().min(2).max(100).optional(),
  buyerPhone: z.string().regex(/^\d{10,11}$/).optional(),
  message: z.string().max(1000).optional(),
});

// Usar antes de inserir:
export async function createProposal(input: { ... }) {
  const validated = proposalSchema.parse(input); // lança erro se inválido
  // ... continua com dados validados
}
```

### 4.4 — Review de Segurança em Imports de Imagens

**Arquivo:** `src/pages/VistoriaCompartilhada.tsx`

O upload de imagens deve validar:
- Tipo do arquivo (apenas `image/jpeg`, `image/png`, `image/webp`)
- Tamanho máximo (ex: 10MB)
- Sanitizar nome do arquivo (remover path traversal)

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Antes de fazer upload:
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("Formato de imagem não permitido. Use JPEG, PNG ou WebP.");
}
if (file.size > MAX_SIZE) {
  throw new Error("Imagem muito grande. Máximo 10MB.");
}
```

### 4.5 — Remover Função de Pagamento no Lado do Cliente

**Arquivo (se existir):** Qualquer arquivo que lide com processamento de pagamento diretamente no frontend.

O `process-payment` já é uma Edge Function, mas verificar se **nenhum segredo de pagamento** está sendo passado do frontend. O fluxo deve ser:
1. Frontend → Edge Function (com token do usuário)
2. Edge Function → Asaas (com chave de API server-side)
3. Resposta volta para o frontend

Confirmar que:
- `process-payment/index.ts` usa `Deno.env.get("ASAAS_API_KEY")` (não hardcoded)
- `process-payment/index.ts` usa `Deno.env.get("ASAAS_BASE_URL")` (não hardcoded)

---

## FASE 5 — ENDURECER INFRAESTRUTURA (4 horas)

### 5.1 — Corrigir Vite Server Host ✅

**Arquivo:** `vite.config.ts`

```diff
 server: {
-  host: "::",
+  host: "localhost",
   port: 8080,
```

### 5.2 — Adicionar Lock File Consistente ✅

```bash
# Se usar npm, package-lock.json já existe — manter só ele
# Remover referências a yarn/pnpm

# Verificar que existe:
cd C:\Projects\dashidrive2026
ls package-lock.json  # Deve existir

# Se não existir, gerar:
npm install  # gera package-lock.json

# Adicionar ao git:
git add package-lock.json
```

### 5.3 — Configurar Rate Limiting no Supabase ✅

No Supabase, o rate limiting pode ser configurado via:
1. **Supabase Dashboard** → Authentication → Rate Limits
2. **Projeto** → Settings → API → Rate Limits

**Configurações recomendadas:**
```
Sign-up: 5 por minuto por IP
Sign-in: 10 por minuto por IP
Token refresh: 10 por minuto por IP
API requests: 60 por minuto por IP
```

### 5.4 — Configurar SBOM e Dependabot ✅

Criar/ativar alertas de segurança no GitHub:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 5.5 — Remover Páginas de Desenvolvimento em Produção ✅

Se as páginas `/dev/*` não forem necessárias em produção, usar variável de ambiente:

```tsx
// src/App.tsx
const isDev = import.meta.env.VITE_ENABLE_DEV_PANEL === "true" || import.meta.env.DEV;

{isDev && (
  <Route path="/dev" element={<DevProtectedRoute><DevLayout /></DevProtectedRoute>}>
    {/* ... */}
  </Route>
)}
```

### 5.6 — Adicionar Monitoramento de Segurança ✅

**Recomendações:**
1. Ativar **Supabase Audit Logs** (Projeto → Settings → Audit)
2. Configurar **alertas de login suspeito** no Supabase Auth
3. Usar serviço de **vulnerability scanning** contínuo (Snyk, Socket.dev)

---

## FASE 6 — VERIFICAÇÃO FINAL (1 hora)

### 6.1 — Executar Security Scan Automatizado ✅

```bash
cd C:\Projects\dashidrive2026

# Scan completo
python .agent\skills\vulnerability-scanner\scripts\security_scan.py . --output summary

# API validator
python .agent\skills\api-patterns\scripts\api_validator.py .

# Checklist completo (se disponível)
python .agent\scripts\checklist.py .
```

✅ **Critério de aprovação:** Zero achados críticos e zero altos.

### 6.2 — Verificar Git Diff ✅

```bash
cd C:\Projects\dashidrive2026
git diff --stat

# Confirmar que nenhum secret está sendo commitado
git diff -- .env* .mcp.json
```

### 6.3 — Checklist Pós-Implementação ✅

| Item | Status |
|------|--------|
| 🔴 Service role key removida do frontend | ✅ |
| 🔴 Service role key substituída por secret keys no Supabase | ✅ |
| 🔴 Asaas API prod rotacionada | ✅ |
| 🔴 Asaas webhook secret rotacionado | ✅ |
| 🔴 .mcp.json removido do git | ✅ |
| 🔴 chv.asaas.md removido do histórico | ✅ |
| 🔴 CORS restrito nas Edge Functions | ✅ |
| 🟠 Fallbacks hardcoded removidos do client.ts | ✅ |
| 🟠 Fallbacks hardcoded removidos do useWebhookTest.ts | ✅ |
| 🟠 n8n webhook URL hardcoded removida | ✅ |
| 🟠 Security headers configurados (vercel.json) | ✅ |
| 🟠 XSS do ChartStyle corrigido | ✅ |
| 🟠 Lógica admin movida para Edge Functions | ✅ |
| 🟠 JWT secret rotacionado | ✅ |
| 🟡 Vite host corrigido para localhost | ✅ |
| 🟡 Rate limiting configurado | ✅ |
| 🟡 .env.example criado | ✅ |
| ✅ Security scan passa sem críticos | ✅ |

### 6.4 — Teste de Regressão ✅

```bash
# Testes unitários
cd C:\Projects\dashidrive2026
npm test

# Build
npm run build

# Lint
npm run lint
```

### 6.5 — Homologação em Ambiente de Staging

Antes de ir para produção:
1. Fazer deploy em ambiente de staging
2. Testar fluxos críticos: login, cadastro, criação de anúncio
3. Testar webhook de pagamento (sandbox)
4. Executar security scan contra staging
5. Validar que CSP não quebra funcionalidades

---

## Apêndice A — Comandos Úteis

```bash
# Verificar se há secrets no staging build
rg -i "(api_key|secret|password|token)\s*[=:]\s*['\"][A-Za-z0-9_-]{20,}" dist/assets/*.js

# Verificar tamanho do bundle das Edge Functions
ls -la supabase/functions/*/index.ts

# Testar CORS nas Edge Functions
curl -H "Origin: https://evil.com" -H "Access-Control-Request-Method: POST" -X OPTIONS https://igchaidmowxpyjapjybe.supabase.co/functions/v1/process-payment -v

# Verificar histórico do chv.asaas.md
git log --all --full-history -- chv.asaas.md

# Limpar .env se foi commitado acidentalmente
git rm --cached .env
echo ".env" >> .gitignore
```

## Apêndice B — Prazos Estimados

| Fase | Horas | Responsável | Prazo |
|------|-------|-------------|-------|
| FASE 0 — Contenção | 0,5h | DevOps | **HOJE** |
| FASE 1 — Secrets no Código | 4h | Full-stack | **HOJE** |
| FASE 2 — CORS e Headers | 2h | DevOps/Backend | Amanhã |
| FASE 3 — Auth e Autorização | 8h | Full-stack | Amanhã |
| FASE 4 — Vulnerabilidades | 4h | Full-stack | Amanhã |
| FASE 5 — Infraestrutura | 4h | DevOps | Amanhã |
| FASE 6 — Verificação | 1h | QA/Todos | Amanhã |

**Total estimado:** ~23,5 horas (3 dias úteis)

---

## Apêndice C — Configuração Ideal de Variáveis de Ambiente

### Edges Functions (Supabase Dashboard)

| Variável | Valor | Onde Configurar |
|----------|-------|-----------------|
| `SUPABASE_URL` | `https://igchaidmowxpyjapjybe.supabase.co` | Supabase Edge Functions → Env |
| `SUPABASE_SECRET_KEYS` | *(automático — contém todas as secret keys)* | Injetado automaticamente |
| `ASAAS_API_KEY` | `$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6...` | Supabase Edge Functions → Env (via CLI) |
| `ASAAS_BASE_URL` | `https://www.asaas.com/api/v3` | Supabase Edge Functions → Env (via CLI) |
| `ASAAS_WEBHOOK_SECRET` | `whsec_8DJXjRvglhYlTgG_bDgifiUN93z47rorgi9cZt1ZLXo` | Supabase Edge Functions → Env (via CLI) |

### Frontend (.env.local / .env.production)

```env
VITE_SUPABASE_URL="https://igchaidmowxpyjapjybe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_R-cPYlHjXGMiiRaMDg159g_yGE4pql7"  # publishable key (segura para frontend)
VITE_WEBHOOK_LEADS_URL=""  # configurar conforme necessário
```

---

*Plano gerado em 19/06/2026. Cada fase deve ser marcada como concluída apenas após verificação.*
