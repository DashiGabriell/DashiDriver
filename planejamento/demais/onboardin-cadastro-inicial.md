# Funil de Onboarding Gameficado — DashiDrive

A ideia aqui é fazer o usuário “entrar no universo” da plataforma antes mesmo do cadastro.
O onboarding precisa parecer um app premium, rápido, intuitivo e com sensação de progresso.

O objetivo principal é:

* identificar o perfil do usuário
* adaptar automaticamente a experiência
* reduzir atrito
* aumentar conversão

---

# Estrutura do Funil

## Tela 1 — Welcome / Entrada

### Objetivo:

Criar impacto visual e direcionar o usuário.

### Layout:

* Fundo na cor padrão da aplicação
* Logo da DashiDrive
* Headline forte:

> “A plataforma inteligente para locação e gestão de veículos.”

### CTA:

* Botão principal:

  * **Começar agora**

### UX:

Ao clicar:

* animação de transição
* barra de progresso aparece no topo
* som/opcional haptic mobile

---

# Tela 2 — “Quem é você?”

## A tela mais importante do fluxo.

### Headline:

> “Como você deseja usar a DashiDrive?”

### Subtexto:

> “Escolha o perfil que mais combina com você.”

---

# Cards Gameficados (3 opções)

## 1. Motorista

### Card:

* Ícone de volante
* Badge:

  * “Encontrar carro para trabalhar”
* Texto:

> “Busque veículos para Uber, 99 e entregas.”

### CTA:

* “Sou motorista”

---

## 2. Locador Marketplace

### Card:

* Ícone de megafone/anúncio
* Badge:

  * “Anunciar veículos”
* Texto:

> “Publique veículos e receba propostas.”

### CTA:

* “Quero anunciar”

---

## 3. Locador Gestão Completa

### Card:

* Ícone dashboard/frota
* Badge:

  * “Gestão profissional”
* Texto:

> “Controle frota, pagamentos, checklists e operação.”

### CTA:

* “Quero gerenciar”

---

# Comportamento UX

Ao clicar:

* card cresce
* brilho/glow premium
* vibração leve no mobile
* barra de progresso avança
* frase dinâmica aparece:

Exemplo:

> “Perfeito. Vamos preparar sua experiência.”

---

# Fluxo Inteligente por Perfil

---

# FLUXO 1 — MOTORISTA

## Objetivo:

Levar rapidamente ao marketplace.

## Próxima tela:

### “Que tipo de veículo você procura?”

Botões:

* Econômico
* Comfort
* Black
* Utilitário

(opcional, ajuda algoritmo/recomendação)

---

## Próxima:

Cadastro rápido:

* Nome
* Whatsapp

### CTA:

> “Entrar no Marketplace”

---

## Resultado:

Usuário entra direto em:

* MarketplaceHome
* Busca de veículos
* Favoritos
* Propostas

---

# FLUXO 2 — LOCADOR MARKETPLACE

## Objetivo:

Transformar em anunciante rapidamente.

---

## Pergunta:

### “Quantos veículos deseja anunciar?”

Botões:

* 1–3
* 4–10
* 10+

---

## Próxima:

### “Deseja apenas anunciar ou também gerenciar?”

Botões:

* Apenas anunciar
* Quero gestão completa

⚠️ Aqui você cria UPSELL para o SaaS.

---

## Próxima:

Cadastro:

* Nome
* Nome da locadora
* Telefone/whatsapp

---

## Resultado:

Usuário entra em:

* MarketplaceMyAds.tsx
* MarketplaceSell.tsx

---

# FLUXO 3 — LOCADOR GESTÃO COMPLETA

## Objetivo:

Converter para plano SaaS.

---

## Pergunta:

### “Qual o tamanho da sua operação?”

Botões:

* Até 5 veículos
* Até 20 veículos
* Mais de 20 veículos

---

## Inteligência de plano

### Até 5:

Sugere:

* Plano Básico

### Até 20:

Sugere:

* Plano PRO

### Mais de 20:

Sugere:

* Plano MASTER

Baseado nas limitações reais da plataforma: 

---

## Próxima:

### “O que você mais precisa hoje?”

Seleção múltipla:

* Controle financeiro
* Gestão de motoristas
* Checklists
* Marketplace
* Controle de manutenção
* Alertas

Isso ajuda:

* personalização
* analytics
* onboarding contextual

---

## Próxima:

Cadastro completo:

* Nome
* Empresa
* Whatsapp

---

## Resultado:

Usuário entra em:

* Dashboard.tsx
* Onboarding da empresa
* setup inicial da frota

---

# Sistema de Progressão

## Barra Premium

Topo da tela:

* 20%
* 40%
* 60%
* 100%

---

# Micro-interações

## Cada clique:

* animação Framer Motion
* glow azul (cor de destaque do projeto)
* som positivo, breve e baixo
* loading elegante

---

# Gamificação

## Exemplos:

### Após escolher perfil:

> “Excelente escolha.”

### Após concluir:

> “Sua central DashiDrive está pronta.”

---

# Estrutura Técnica Recomendada

## Página principal:

### `OnboardingCadastro.tsx`

---

# Componentes

## `RoleSelectionCard.tsx`

Card clicável do perfil.

## `ProgressHeader.tsx`

Barra premium.

## `OnboardingStep.tsx`

Wrapper animado.

## `AnimatedChoiceButton.tsx`

Botões gameficados.

---

# Estrutura de Estado

```ts
type UserIntent =
  | "driver"
  | "marketplace_owner"
  | "fleet_management";
```

---

# Resultado Estratégico

Esse fluxo resolve 4 problemas enormes:

## 1. Segmentação automática

Você entende quem entrou.

---

## 2. UX personalizada

Cada usuário vê somente o que importa.

---

## 3. Upsell natural

Marketplace → Gestão completa.

---

## 4. Melhor retenção

Usuário não entra “perdido”.

---

# Melhor parte

Esse onboarding encaixa PERFEITAMENTE com a arquitetura atual da DashiDrive:

* Marketplace
* ERP
* Multi-tenant
* Mobile-first
* Fluxos separados

Tudo já documentado na estrutura existente da plataforma. 
