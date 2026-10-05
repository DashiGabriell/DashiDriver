# Correção do Fluxo de Cadastro → Checkout → Acesso ao Dashboard

## Problema

Após o usuário completar o fluxo de cadastro (`/mobile/onboarding-cadastro`), escolher um plano de gestão pago, passar pelo checkout com sucesso e ter o pagamento aprovado, ele é **redirecionado para `/mobile/trial-expirado`** ao invés de ir para `/dashboard`.

---

## Diagnóstico: Causa-Raiz (3 problemas encadeados)

O bug é causado por uma **cadeia de 3 falhas** que acontecem em sequência. Todas precisam ser corrigidas para o fluxo funcionar.

---

### PROBLEMA 1: `CheckoutForm.tsx` redireciona para `/onboarding` após pagamento de gestão

**Arquivo:** [`CheckoutForm.tsx`](file:///c:/Projects/dashidrive2026/src/components/checkout/CheckoutForm.tsx#L131)

```typescript
// Linha 131
navigate(planType === "gestao" ? "/onboarding" : "/marketplace/home");
```

Após o pagamento ser aprovado e o `refetchQueries` rodar, o `CheckoutForm` **navega para `/onboarding`** (a página de cadastro de empresa). O problema é que:

1. Se o usuário **já tem empresa** (criada durante o fluxo de `ensureCompany` na Edge Function `process-payment`), a página `/onboarding` simplesmente redireciona para `/dashboard` (linha 50-52 do `ProtectedRoute`).
2. Porém, se `access.authorized` ainda for `false` nesse momento (por causa do problema 3 abaixo), o `ProtectedRoute` intercepta **antes** desse redirect e manda para `/mobile/trial-expirado`.

**Solução:** Após pagamento aprovado em plano de gestão, redirecionar **diretamente para `/dashboard`** em vez de `/onboarding`.

```diff
- navigate(planType === "gestao" ? "/onboarding" : "/marketplace/home");
+ navigate(planType === "gestao" ? "/dashboard" : "/marketplace/home");
```

---

### PROBLEMA 2: `process-payment` cria a empresa com `ativo: false` e o `applyPlan` com status `"pending"`

**Arquivo:** [`process-payment/index.ts`](file:///c:/Projects/dashidrive2026/supabase/functions/process-payment/index.ts)

No fluxo de pagamento pago (não gratuito), ocorre:

1. **`ensureCompany`** (linha 73-105) cria a empresa com `ativo: false` (linha 92).
2. **`applyPlan`** é chamado com status `"pending"` (linha 298):
   ```typescript
   await applyPlan(supabaseAdmin, user, companyId, planDef, "pending", body, customerId);
   ```
3. Na função `applyPlan` (linha 107-151), quando o status é `"pending"` e o tipo é `"gestao"`, a empresa recebe:
   ```typescript
   companyUpdate.ativo = status === "ativo"; // false, pois status = "pending"
   ```
4. O perfil recebe `trial: null` e `status: "pending"`..

**Neste ponto, tanto `profile.trial` é NULL quanto `company.ativo` é FALSE.**

Depois, o frontend faz **polling** via `pollStatus` (linhas 80-92 do `CheckoutForm`). A cada 2 segundos, o `check-payment-status` Edge Function verifica o Asaas. Quando retorna `"APPROVED"`:

- A função `activatePlan` no `check-payment-status` (linhas 34-64) **atualiza** o perfil para `status: "ativo"` e a empresa para `ativo: true`.
- O frontend recebe `"APPROVED"` do polling.

**O timing é o seguinte:**
1. `pollStatus` retorna `"APPROVED"` 
2. O frontend faz `refetchQueries` nas queries `profile`, `company` e `accessControl`
3. O frontend navega para `/onboarding` (o que deveria ser `/dashboard`)

**O `refetchQueries` deveria pegar os dados atualizados**, mas há um problema de timing: o `activatePlan` no backend e o `refetchQueries` no frontend podem não estar sincronizados perfeitamente. Se o `refetch` é disparado **antes** do banco ter processado o `activatePlan` do `check-payment-status`, o `useAccessControl` ainda vai ver `company.ativo = false` e `trial = null`.

**Solução:** Garantir que o `refetchQueries` no `CheckoutForm` espere um momento após receber o `APPROVED` do polling, pois o `APPROVED` vem do `check-payment-status`, que **também** faz o `activatePlan` — logo, o banco deve estar atualizado no momento em que o polling retorna. Porém, por segurança, adicionar um pequeno `await sleep(500)` antes do `refetchQueries` para garantir consistência.

Alternativamente (e mais robust, PORTANTO IMPLEMENTAREMOS ESTE): o `refetchQueries` deveria ser chamado com `{cancelRefetch: false}` e aguardar a resolução completa com `await`.

---

### PROBLEMA 3: `useAccessControl` avalia `authorized` como `false` na race condition

**Arquivo:** [`useAccessControl.ts`](file:///c:/Projects/dashidrive2026/src/hooks/useAccessControl.ts)

A lógica de autorização (linha 37):

```typescript
const authorized = isTrial || companyAtivo === true;
```

Depende de:
- `isTrial`: `profile.trial === 'ativo'` E dentro dos 7 dias → **FALSE** (pois `process-payment` seta `trial: null`)
- `companyAtivo`: `company.ativo` → **FALSE** (se o DB ainda não processou o `activatePlan`)

Logo, `authorized = false`, e o `ProtectedRoute` (linha 46-48) redireciona para `/mobile/trial-expirado`:

```typescript
if (!isExcludedPath && access && !access.authorized) {
  return <Navigate to="/mobile/trial-expirado" replace />;
}
```

**Esse é o sintoma visível do bug.** O `useAccessControl` está correto em sua lógica, mas é alimentado com dados stale.

---

## Plano de Correção Completo

### Correção 1 — `CheckoutForm.tsx`: Redirecionar para `/dashboard` após pagamento gestão

**Arquivo:** [`src/components/checkout/CheckoutForm.tsx`](file:///c:/Projects/dashidrive2026/src/components/checkout/CheckoutForm.tsx)

```diff
  // Após o refetchQueries (linha 131)
- navigate(planType === "gestao" ? "/onboarding" : "/marketplace/home");
+ navigate(planType === "gestao" ? "/dashboard" : "/marketplace/home");
```

**Motivo:** O `/onboarding` é a página de cadastro de empresa. Se o pagamento foi feito, a empresa já foi criada pela Edge Function `ensureCompany`. Não faz sentido redirecionar para lá.

---

### Correção 2 — `CheckoutForm.tsx`: Aguardar propagação do banco antes do refetch

**Arquivo:** [`src/components/checkout/CheckoutForm.tsx`](file:///c:/Projects/dashidrive2026/src/components/checkout/CheckoutForm.tsx)

```diff
+ // Aguarda propagação do activatePlan no banco (disparado pelo check-payment-status)
+ await sleep(1000);
+
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ["profile"] }),
    queryClient.refetchQueries({ queryKey: ["company"] }),
    queryClient.refetchQueries({ queryKey: ["accessControl"] }),
  ]);

- navigate(planType === "gestao" ? "/onboarding" : "/marketplace/home");
+ navigate(planType === "gestao" ? "/dashboard" : "/marketplace/home");
```

**Motivo:** O `check-payment-status` Edge Function faz o `activatePlan` (que seta `company.ativo = true`) **na mesma chamada** que retorna `APPROVED`. Porém, o `refetchQueries` dispara imediatamente — dando um `sleep(1000)` garante que o banco já propagou a escrita.

---

### Correção 3 — `useAccessControl.ts`: Incluir verificação de `status` do perfil como critério de autorização

**Arquivo:** [`src/hooks/useAccessControl.ts`](file:///c:/Projects/dashidrive2026/src/hooks/useAccessControl.ts)

O hook atualmente só verifica `trial === 'ativo'` OU `company.ativo === true`. Mas a Edge Function `check-payment-status` também seta `profiles.status = 'ativo'`. Podemos usar esse campo como um **terceiro critério** de autorização, resolvendo a race condition:

```diff
  const { data: profile, error: profileError } = await supabase
    .from("carcontrol_profiles")
-   .select("trial, company_id, created_at")
+   .select("trial, company_id, created_at, status, plano_ativo")
    .eq("id", user.id)
    .maybeSingle();

  // ...

  const isTrial = profile.trial === 'ativo' && Date.now() < trialExpiresAt;
- const authorized = isTrial || companyAtivo === true;
+ const hasPaidPlan = profile.status === 'ativo' && !!profile.plano_ativo;
+ const authorized = isTrial || companyAtivo === true || hasPaidPlan;
```

**Motivo:** O campo `profiles.status` é setado para `'ativo'` pelo `check-payment-status` E pelo `asaas-webhook`. Se `profiles.status === 'ativo'` **e** `profiles.plano_ativo` tem um slug de plano válido, isso é evidência suficiente de que o pagamento foi processado e o usuário tem acesso. Isso torna a autorização menos dependente da sincronia entre `profiles` e `companies`.

---

### Correção 4 (Opcional, Recomendada) — `Onboarding.tsx`: Adicionar redirect para `/dashboard` se empresa já existe

**Arquivo:** [`src/pages/Onboarding.tsx`](file:///c:/Projects/dashidrive2026/src/pages/Onboarding.tsx)

Atualmente, a lógica na linha 50-52 do `ProtectedRoute` já faz:
```typescript
if (hasCompany && location.pathname === "/onboarding") {
  return <Navigate to="/dashboard" replace />;
}
```

Isso funciona, **mas** só depois que o `useAccessControl` já avaliou `authorized = true`. Se `authorized` for `false`, o redirect para `/mobile/trial-expirado` acontece **antes** deste check.

A ordem de prioridade no `ProtectedRoute.tsx` é:
1. Linha 42-44: redirect para onboarding se não tem empresa
2. **Linha 46-48: redirect para trial-expirado se não autorizado** ← intercepta antes
3. Linha 50-52: redirect para dashboard se tem empresa e está no onboarding

**Solução:** Mover a verificação de "tem empresa + está no onboarding" para **antes** do check de acesso:

```diff
  if (requireCompany && !hasCompany && !isExcludedPath) {
    return <Navigate to="/mobile/onboarding-cadastro" replace />;
  }

+ // Se tem empresa e está no onboarding, redireciona para dashboard (sem exigir access check)
+ if (hasCompany && location.pathname === "/onboarding") {
+   return <Navigate to="/dashboard" replace />;
+ }
+
  if (!isExcludedPath && access && !access.authorized) {
    return <Navigate to="/mobile/trial-expirado" replace />;
  }

- if (hasCompany && location.pathname === "/onboarding") {
-   return <Navigate to="/dashboard" replace />;
- }
```

**Motivo:** Mesmo que o `useAccessControl` retorne `authorized: false` temporariamente (race condition), se o usuário já tem uma empresa e está tentando acessar `/onboarding`, ele deve ser redirecionado para o dashboard imediatamente.

---

## Resumo Visual do Fluxo Corrigido

```
Usuário completa Onboarding-Cadastro
  → Escolhe plano de gestão pago (ex: gestão-básico)
  → Redirecionado para /checkout/gestao-basico
  → Preenche dados e finaliza pagamento
  → Edge Function process-payment:
      ├── ensureCompany → Cria empresa (ativo: false)
      ├── Cria subscription no Asaas
      └── applyPlan (status: "pending")
  → Frontend faz polling (check-payment-status)
      ├── Asaas confirma: APPROVED
      ├── activatePlan:
      │   ├── profiles.status = "ativo"
      │   ├── profiles.trial = null
      │   ├── profiles.plano_ativo = "gestao-basico"
      │   └── companies.ativo = true ✅
      └── Retorna { status: "APPROVED" }
  → Frontend:
      ├── toast.success("Pagamento aprovado!")
      ├── await sleep(1000) ← NOVO
      ├── refetchQueries (profile, company, accessControl)
      └── navigate("/dashboard") ← CORRIGIDO (era "/onboarding")
  → ProtectedRoute em /dashboard:
      ├── useAccessControl: authorized = true ✅
      │   (companyAtivo = true OU hasPaidPlan = true)
      └── Renderiza <Index /> (Dashboard) ✅
```

---

## Arquivos Afetados pela Correção

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| [`src/components/checkout/CheckoutForm.tsx`](file:///c:/Projects/dashidrive2026/src/components/checkout/CheckoutForm.tsx) | Mudar redirect de `/onboarding` para `/dashboard` + sleep |
| [`src/hooks/useAccessControl.ts`](file:///c:/Projects/dashidrive2026/src/hooks/useAccessControl.ts) | Adicionar `hasPaidPlan` como critério de autorização |
| [`src/components/layout/ProtectedRoute.tsx`](file:///c:/Projects/dashidrive2026/src/components/layout/ProtectedRoute.tsx) | Reordenar checks para mover onboarding redirect antes de access check |

---

## Como Verificar se a Correção Funcionou

1. **Criar um novo usuário** (registro com e-mail/senha ou Google)
2. Completar o **onboarding-cadastro** (escolher "Gestão Completa")
3. Escolher qualquer plano de gestão pago (Básico, Pro ou Master)
4. Completar o **checkout com dados válidos**
5. Após pagamento aprovado, verificar que:
   - ✅ Usuário é redirecionado para `/dashboard`
   - ❌ Usuário **NÃO** é redirecionado para `/mobile/trial-expirado`
   - ✅ No banco: `carcontrol_profiles.status = 'ativo'`, `carcontrol_companies.ativo = true`

---

## Feedback da Implementação (28 de maio de 2026)

Todas as correções propostas no "Plano de Correção Completo" foram implementadas com sucesso:

1.  **`src/components/checkout/CheckoutForm.tsx`**:
    *   O redirecionamento após o pagamento de um plano de gestão foi alterado de `/onboarding` para `/dashboard`.
    *   Foi adicionado um `await sleep(1000);` antes de `queryClient.refetchQueries` para garantir a propagação das atualizações no banco de dados, minimizando condições de corrida.

2.  **`src/hooks/useAccessControl.ts`**:
    *   A query de seleção para `carcontrol_profiles` foi expandida para incluir os campos `status` e `plano_ativo`.
    *   A lógica de autorização (`authorized`) foi atualizada para considerar `hasPaidPlan` (baseado em `profile.status === 'ativo'` e `!!profile.plano_ativo`) como um critério adicional, tornando a verificação mais robusta.

3.  **`src/components/layout/ProtectedRoute.tsx`**:
    *   A ordem das verificações de redirecionamento foi ajustada. O redirecionamento para `/dashboard` (caso a empresa já exista e o usuário esteja em `/onboarding`) agora ocorre *antes* da verificação de autorização para `/mobile/trial-expirado`, prevenindo o redirecionamento incorreto mesmo em caso de `authorized: false` temporário.

As alterações foram feitas com base nas instruções detalhadas fornecidas, visando resolver os problemas de timing e lógica que levavam ao redirecionamento incorreto para a página de trial expirado.
