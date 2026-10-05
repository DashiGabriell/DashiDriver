# Plano de Proteção DDoS — DashiDrive

**Data:** 28/06/2026
**Stack:** Lovable / Vercel / Supabase
**Objetivo:** Proteção real contra ataques DDoS utilizando recursos nativos (sem migrar de plataforma)

---

## Contexto

O projeto já possui proteção nativa gratuita que provavelmente não está sendo aproveitada ao máximo:

| Camada | O que já existe | Status |
|--------|----------------|--------|
| **Vercel DDoS Mitigation** | Proteção L3/L4/L7 automática para TODOS os planos (grátis) | ✅ Ativa por padrão |
| **Supabase CDN** | Cloudflare + fail2ban no nível de rede | ✅ Ativa por padrão |
| **Edge Functions** | Rate limiting em 9/10 funções | ⚠️ Parcial |
| **Security Monitor** | Brute force detection + denylist | ✅ Funcionando |
| **Vercel WAF** | Custom rules, IP blocking, Attack Mode | ❌ Não configurado |

---

## FASE 1 — Ativar Proteções Gratuitas do Vercel (30 min)

### 1.1 — Ativar Attack Mode no Dashboard da Vercel

**O que faz:** Durante um ataque, desafia TODAS as visitas com browser check. Apenas usuários reais passam.

**Como:** Vercel Dashboard → Projeto → Settings → Firewall → Attack Mode → Ativar

> **Uso:** Somente durante ataques ativos. É temporário e bloqueia até usuários legítimos (mas garante que só humanos passam).

### 1.2 — Configurar IP Blocking no Dashboard

**Como:** Vercel Dashboard → Projeto → Firewall → IP Blocking

Adicionar IPs suspeitos que o Security Monitor já identificou na `security_denylist`.

### 1.3 — Configurar Spend Management

**Como:** Vercel Dashboard → Settings → Usage → Spend Management

Definir limite mensal para evitar "denial of wallet" (ataque que gera conta gigante).

---

## FASE 2 — Configurar Rate Limiting no Supabase Dashboard (15 min)

### 2.1 — Rate Limits de Autenticação

**Como:** Supabase Dashboard → Authentication → Rate Limits

| Recurso | Limite Recomendado |
|---------|-------------------|
| Sign-up | 5/min por IP |
| Sign-in | 10/min por IP |
| Token refresh | 10/min por IP |
| Password recovery | 5/min por IP |
| OTP | 5/min por IP |

---

## FASE 3 — Completar Rate Limiting nas Edge Functions (20 min)

### 3.1 — Adicionar rate limiting na `chatbot-query`

**Única Edge Function sem rate limiting.** Consome tokens da OpenRouter (custo financeiro).

```typescript
// Em chatbot-query/index.ts, adicionar:
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

// No início do handler, antes de processar:
const rateLimitCheck = await checkRateLimit(supabase, `chatbot:${userId}`, 15, 60);
if (!rateLimitCheck.success) {
  return rateLimitResponse(rateLimitCheck.retryAfter);
}
```

---

## FASE 4 — Middleware de Segurança no Vercel (1h)

### 4.1 — Criar Edge Middleware para Filtro de Request

Criar `middleware.ts` na raiz do projeto (Vercel executa automaticamente):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Bloquear user-agents suspeitos
  const ua = request.headers.get('user-agent') || '';
  const suspiciousBots = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab'];
  if (suspiciousBots.some(bot => ua.toLowerCase().includes(bot))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
```

### 4.2 — Adicionar Headers Extras de Segurança

No `vercel.json`, adicionar:

```json
{ "key": "X-DNS-Prefetch-Control", "value": "on" },
{ "key": "X-XSS-Protection", "value": "1; mode=block" }
```

---

## FASE 5 — CAPTCHA nos Formulários Públicos (2h)

### 5.1 — Adicionar Turnstile (Cloudflare) no Login/Cadastro

O Turnstile é **gratuito** e não requer conta Cloudflare:

```bash
npm install @marsidev/react-turnstile
```

Adicionar no `Login.tsx` e `OnboardingCadastro.tsx`:

```tsx
import { Turnstile } from '@marsidev/react-turnstile';

<Turnstile
  siteKey="0x4AAAAAAA..." // Chave pública do Turnstile
  onSuccess={(token) => setCaptchaToken(token)}
/>
```

Validar o token na Edge Function de auth ou via middleware.

---

## FASE 6 — Monitoramento e Resposta (contínuo)

### 6.1 — Configurar Alertas no Vercel

- Vercel Dashboard → Settings → Notifications → Usage Alerts
- Configurar alerta quando Edge Requests ultrapassar threshold

### 6.2 — Dashboard de Firewall

- Vercel Dashboard → Projeto → Firewall → Overview
- Monitorar tráfego bloqueado e desafiado

### 6.3 — Supabase Logs

- Supabase Dashboard → Logs → Auth Logs
- Verificar tentativas de login falhas

---

## Resumo de Custos

| Item | Custo |
|------|-------|
| Vercel DDoS Mitigation | **Grátis** (todos os planos) |
| Vercel Attack Mode | **Grátis** (todos os planos) |
| Vercel IP Blocking | **Grátis** (todos os planos) |
| Supabase Rate Limits | **Grátis** (configurável) |
| Cloudflare Turnstile | **Grátis** |
| Vercel WAF (Custom Rules) | **$20/mês** (Pro plan) — opcional |
| **Total mínimo** | **$0** |

---

## Ordem de Execução Recomendada

1. **FASE 1** (agora) — Ativar Attack Mode + IP Blocking + Spend Management no Vercel
2. **FASE 2** (agora) — Configurar rate limits no Supabase Dashboard
3. **FASE 3** (agora) — Adicionar rate limiting no chatbot-query
4. **FASE 4** (hoje) — Criar middleware.ts
5. **FASE 5** (esta semana) — Adicionar Turnstile nos formulários
6. **FASE 6** (contínuo) — Monitorar

---

## Status de Implementação

| Fase | Status | Data |
|------|--------|------|
| FASE 1 — Vercel Firewall | ⬜ Pendente | - |
| FASE 2 — Supabase Rate Limits | ⬜ Pendente | - |
| FASE 3 — chatbot-query Rate Limit | ⬜ Pendente | - |
| FASE 4 — Edge Middleware | ⬜ Pendente | - |
| FASE 5 — CAPTCHA Turnstile | ⬜ Pendente | - |
| FASE 6 — Monitoramento | ⬜ Pendente | - |
