# Ajuste do Fluxo de Locador Marketplace no Onboarding

Este documento descreve o diagnóstico e a solução exata para corrigir o fluxo de cadastro, escolha de planos e redirecionamento do perfil **Locador Marketplace** no DashiDrive.

---

## 📋 Diagnóstico do Problema

Atualmente, quando um usuário se cadastra e seleciona o perfil **Locador Marketplace** (`role: "marketplace_owner"`) na página `/mobile/onboarding-cadastro`, ocorrem dois problemas críticos que quebram o fluxo:

1. **Exibição de Planos Inadequados (Step 4):** O sistema exibe os planos de **Gestão** de Frotas (`Plano Gestão Básico`, `Pro` ou `Master`) em vez de exibir os planos específicos do **Marketplace** (`Plano Marketplace Free`, `Pro` ou `Elite`).
2. **Redirecionamento Incorreto pós-Onboarding de Empresa:** Após cadastrar a empresa na página `/onboarding`, o sistema redireciona o usuário para o dashboard do SaaS de gestão (`/dashboard`) em vez de enviá-lo ao checkout correspondente ao plano de Marketplace selecionado (`/checkout/marketplace-free`, `/checkout/marketplace-pro` ou `/checkout/marketplace-elite`), impedindo a conclusão da contratação e a correta configuração do plano no banco de dados.

---

## 🛠️ Solução Proposta

A solução é implementada em duas etapas no frontend:

1. **Ajuste na Exibição de Planos:** No arquivo `OnboardingCadastro.tsx`, exibiremos dinamicamente os planos de **Marketplace** no Step 4 se o usuário tiver selecionado a role `'marketplace_owner'`.
2. **Correção do Redirecionamento Final:** No arquivo `Onboarding.tsx`, adicionaremos a rota de redirecionamento para planos de marketplace, garantindo que o usuário seja enviado para a página de checkout adequada.

---

## 📝 Modificações Exatas de Código

### 1. Modificação em [OnboardingCadastro.tsx](file:///c:/Projects/dashidrive2026/src/pages/mobile/OnboardingCadastro.tsx)

No Step 4 da renderização, faremos uma exibição condicional baseada na role do usuário para renderizar os cartões correspondentes:

```diff
           {step === 4 && (
              <motion.div key="step4" {...slideVariants} className="space-y-4 pt-4">
                 <h2 className="text-2xl font-black">Escolha o seu plano</h2>
-                {!alreadyUsedTrial && (
-                  <PlanCard
-                    onClick={handleSelectTrial}
-                    title="Teste 7 Dias Grátis"
-                    price="Gratuito"
-                    icon={Zap}
-                    description="Experimente todas as ferramentas básicas."
-                  />
-                )}
-                <PlanCard
-                  onClick={() => handleAnswer("plan", "gestao-basico")}
-                  title="Plano Gestão Básico"
-                  price="R$ 199/mês"
-                  icon={Building}
-                  description="Para pequenas operações."
-                />
-                <PlanCard
-                  onClick={() => handleAnswer("plan", "gestao-pro")}
-                  title="Plano Gestão Pro"
-                  price="R$ 399/mês"
-                  icon={Building}
-                  description="Para operações em crescimento."
-                />
-                <PlanCard
-                  onClick={() => handleAnswer("plan", "gestao-master")}
-                  title="Plano Gestão Master"
-                  price="R$ 799/mês"
-                  icon={Building}
-                  description="Para locadoras estruturadas."
-                />
+                {respostas.role === 'marketplace_owner' ? (
+                  <>
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "marketplace-free")}
+                      title="Plano Marketplace Free"
+                      price="Gratuito"
+                      icon={Sparkles}
+                      description="Permite até 1 anúncio ativo."
+                    />
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "marketplace-pro")}
+                      title="Plano Marketplace Pro"
+                      price="R$ 119/mês"
+                      icon={Zap}
+                      description="Permite até 10 anúncios ativos."
+                    />
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "marketplace-elite")}
+                      title="Plano Marketplace Elite"
+                      price="R$ 299/mês"
+                      icon={Building}
+                      description="Permite até 25 anúncios ativos."
+                    />
+                  </>
+                ) : (
+                  <>
+                    {!alreadyUsedTrial && (
+                      <PlanCard
+                        onClick={handleSelectTrial}
+                        title="Teste 7 Dias Grátis"
+                        price="Gratuito"
+                        icon={Zap}
+                        description="Experimente todas as ferramentas básicas."
+                      />
+                    )}
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "gestao-basico")}
+                      title="Plano Gestão Básico"
+                      price="R$ 199/mês"
+                      icon={Building}
+                      description="Para pequenas operações."
+                    />
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "gestao-pro")}
+                      title="Plano Gestão Pro"
+                      price="R$ 399/mês"
+                      icon={Building}
+                      description="Para operações em crescimento."
+                    />
+                    <PlanCard
+                      onClick={() => handleAnswer("plan", "gestao-master")}
+                      title="Plano Gestão Master"
+                      price="R$ 799/mês"
+                      icon={Building}
+                      description="Para locadoras estruturadas."
+                    />
+                  </>
+                )}
              </motion.div>
           )}
```

---

### 2. Modificação em [Onboarding.tsx](file:///c:/Projects/dashidrive2026/src/pages/Onboarding.tsx)

No método `handleSubmit`, no bloco de redirecionamento final da empresa criada, vamos adicionar a verificação de planos do tipo `marketplace` para navegar o usuário para as respectivas rotas de checkout (onde ele poderá validar seu CPF/endereço para o plano gratuito ou inserir cartão de crédito para os planos Pro e Elite):

```diff
       setStep("success");
       toast.success("Empresa cadastrada com sucesso!");
 
       // Redirecionar baseado no plano
       setTimeout(() => {
         if (profile?.plan === 'free7dias' || profile?.plan === 'trial') {
           navigate("/mobile/home");
         } else if (profile?.plan && profile.plan.includes('gestao')) {
           navigate(`/checkout/${profile.plan}`);
+        } else if (profile?.plan && profile.plan.includes('marketplace')) {
+          navigate(`/checkout/${profile.plan}`);
         } else {
           navigate("/dashboard");
         }
       }, 2000);
```

---

## 🧪 Plano de Verificação Manual

1. **Passo 1:** Criar um novo usuário ou logar com uma conta sem onboarding concluído.
2. **Passo 2:** Acessar `/mobile/onboarding-cadastro`.
3. **Passo 3:** Escolher o perfil **"Locador Marketplace"**.
4. **Passo 4:** Preencher **Nome** e **WhatsApp** e continuar.
5. **Passo 5:** Validar se a tela de escolha de planos agora mostra:
   - **Plano Marketplace Free** (Gratuito)
   - **Plano Marketplace Pro** (R$ 119/mês)
   - **Plano Marketplace Elite** (R$ 299/mês)
6. **Passo 6:** Selecionar o **Plano Marketplace Pro** ou **Free** e avançar até finalizar o cadastro básico.
7. **Passo 7:** O usuário será redirecionado para `/onboarding` para configurar os dados de sua locadora.
8. **Passo 8:** Preencher os dados da empresa e enviar. Validar se o redirecionamento ocorre corretamente para a tela de checkout correspondente (ex: `/checkout/marketplace-pro` ou `/checkout/marketplace-free`).
9. **Passo 9:** Validar no checkout (por exemplo, ativando o Free preenchendo apenas os dados pessoais ou realizando o fluxo completo para o pago) se o usuário é redirecionado para a página final `/marketplace/home` com seu plano configurado adequadamente e a empresa associada!

---

## 🚀 Feedback da Implementação (28 de maio de 2026)

As correções para o fluxo de **Locador Marketplace** foram implementadas com sucesso:

1.  **Exibição Condicional de Planos (`OnboardingCadastro.tsx`)**:
    *   O componente agora detecta a role selecionada (`marketplace_owner`) e renderiza os planos específicos de marketplace (Free, Pro, Elite), ocultando os planos de gestão de frota.
    *   A lógica de `handleAnswer` garante que o plano correto seja salvo no estado.

2.  **Redirecionamento Inteligente (`Onboarding.tsx`)**:
    *   O método `handleSubmit` foi atualizado para verificar se o plano selecionado pelo usuário contém a string `'marketplace'`.
    *   Caso positivo, o usuário é redirecionado para a rota `/checkout/${profile.plan}`, permitindo a conclusão da contratação do plano de marketplace correto, em vez de ser enviado erroneamente para o dashboard do SaaS de gestão.

As alterações seguem o plano aprovado e resolvem os problemas de inconsistência no fluxo de onboarding para locadores de marketplace.
