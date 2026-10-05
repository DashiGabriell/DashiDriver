# Ajuste do Fluxo de Motorista (Driver) no Onboarding

Este documento descreve o diagnóstico e a solução exata para corrigir o fluxo de cadastro e onboarding do perfil **Motorista** no DashiDrive.

---

## 📋 Diagnóstico do Problema

Atualmente, quando um usuário se cadastra e seleciona o perfil **Motorista** (`role: "driver"`) na página `/mobile/onboarding-cadastro`, ocorrem dois erros no fluxo:

1. **Seleção de Planos Indevida (Step 4):** O motorista é direcionado para a tela de escolha de planos, onde visualiza e é obrigado a selecionar um plano do tipo **Gestão** (`gestao-basico`, `gestao-pro`, etc.). No entanto, o motorista não possui plano de gestão (sua conta é gratuita e focada em buscar veículos no marketplace).
2. **Redirecionamento Incorreto no Final (Step 5):** Ao finalizar o cadastro básico, o sistema redireciona o motorista fixamente para a rota `/onboarding` (que serve para cadastrar uma empresa de locação). Motoristas não criam empresa e devem ser direcionados diretamente para a sua página inicial, que é `/marketplace/home`.

---

## 🛠️ Solução Proposta

Para ajustar este fluxo perfeitamente e sem erros, precisamos alterar apenas o arquivo **`OnboardingCadastro.tsx`**:

1. **Burlar o Step 4 (Escolha de Planos):** Adicionar uma regra no `useEffect` para pular automaticamente a etapa de planos se o perfil do usuário for `'driver'`.
2. **Redirecionamento Condicional:** No método `handleFinalSubmit`, verificar se a role é `'driver'` e navegar o usuário diretamente para `/marketplace/home` em vez de `/onboarding`.

---

## 📝 Modificações Exatas de Código

### 1. Modificação em [OnboardingCadastro.tsx](file:///c:/Projects/dashidrive2026/src/pages/mobile/OnboardingCadastro.tsx)

#### A. Pular a etapa de planos no `useEffect`

Adicionar a verificação do `step === 4` para pular a seleção de planos se a role for `'driver'`.

```diff
  useEffect(() => {
    setProgresso((step / 5) * 100);
    
    // Verifica se o usuário já utilizou o trial no banco de dados e preenche dados básicos
    if (profile) {
      setAlreadyUsedTrial(!!(profile as any).has_used_free_trial);
      
      // Pré-preenche o nome se ainda não estiver definido
      if (!respostas.nome && (profile as any).nome) {
        setRespostas(prev => ({ ...prev, nome: (profile as any).nome }));
      }
    }

    // Pula a etapa de tamanho de frota se não for Gestão Completa
    if (step === 2 && respostas.role !== 'fleet_management') {
      handleNextStep();
    }
+
+   // Pula a etapa de planos se for Motorista (gratuito)
+   if (step === 4 && respostas.role === 'driver') {
+     handleNextStep();
+   }
  }, [step, profile, respostas.role]);
```

#### B. Ajustar o redirecionamento pós-envio em `handleFinalSubmit`

Substituir o redirecionamento fixo para `/onboarding` por um redirecionamento inteligente baseado no perfil.

```diff
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!respostas.role || !respostas.nome || !respostas.whatsapp) {
      toast({ title: "Erro", description: "Preencha todos os dados.", variant: "destructive" });
      return;
    }

    try {
      await saveOnboarding.mutateAsync({
        role: respostas.role,
        nome: respostas.nome,
        whatsapp: respostas.whatsapp,
        trial_intent: respostas.trial_intent,
        plan: respostas.plan,
      });

      toast({ title: "Cadastro finalizado!", description: "Bem-vindo ao DashiDrive." });
-     navigate("/onboarding");
+     if (respostas.role === "driver") {
+       navigate("/marketplace/home");
+     } else {
+       navigate("/onboarding");
+     }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar dados.", variant: "destructive" });
    }
  };
```

---

## 🧪 Plano de Verificação Manual

1. **Passo 1:** Criar um novo usuário ou logar com uma conta sem onboarding concluído.
2. **Passo 2:** Acessar a rota `/mobile/onboarding-cadastro`.
3. **Passo 3:** Na seleção de perfil, escolher **"Motorista"**.
4. **Passo 4:** Inserir o **Nome** e **WhatsApp** e clicar em **"Continuar"**.
5. **Passo 5:** Verificar se a tela de escolha de planos de gestão foi **pulada automaticamente**, indo direto para a tela final ("Tudo pronto!").
6. **Passo 6:** Clicar em **"Vamos nessa!"** e validar se o usuário é redirecionado corretamente para `/marketplace/home` e o perfil é atualizado no banco de dados com a role `motorista` sem planos indevidos associados.

---

## 🔍 Constatação das Alterações e Status de Teste (Linha 105+)

> [!NOTE]
> **Status da Implementação:** Concluído e Confirmado.
> As alterações descritas acima já se encontram **totalmente integradas e ativas** no arquivo `OnboardingCadastro.tsx` do seu projeto. 

### O que foi constatado:
1. **Pulo do Step 4 (Planos de Gestão) no `useEffect`:** Confirmamos que a instrução que analisa se a role é `'driver'` e o step é `4`, invocando `handleNextStep()` de forma transparente, já está presente.
2. **Redirecionamento Inteligente no `handleFinalSubmit`:** Confirmamos que o redirecionamento condicional para `/marketplace/home` se a role for `'driver'` (ou `/onboarding` para as demais roles de administração) já está ativo no arquivo.

### Posso testar?
**Sim, absolutamente!** O fluxo está 100% pronto para ser testado de imediato. Não é necessário fazer nenhuma modificação adicional no seu código local, pois as soluções necessárias já estão integradas.

#### Como testar agora:
1. Faça login em uma conta de teste que ainda não tenha passado pelo onboarding (ou crie um novo usuário).
2. Acesse a rota `/mobile/onboarding-cadastro`.
3. Selecione a opção **"Motorista"**.
4. Insira os dados básicos (Nome e WhatsApp) e avance.
5. Verifique se a tela de planos foi pulada automaticamente, exibindo diretamente a etapa final de confirmação.
6. Ao clicar em **"Vamos nessa!"**, certifique-se de que a página navega corretamente para a página inicial dos motoristas em `/marketplace/home`.
