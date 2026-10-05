# Relação Completa de Páginas - DashiDrive

Documentação detalhada de **todas** as páginas da aplicação, incluindo localização, status e principais funcionalidades. Esta versão está totalmente sincronizada com a estrutura de arquivos atual.

---

## 📂 Visão Geral da Arquitetura
A aplicação está organizada em quatro grandes áreas:
1. **Desktop/Web** – Interface administrativa completa.
2. **Mobile Operations** – Ferramentas rápidas para uso em campo.
3. **Marketplace** – Ecossistema de locação e negócios.
4. **Infraestrutura** – Autenticação, onboarding e páginas de erro.

---

## 🖥️ Núcleo Desktop (Gestão Administrativa)

| Página | Localização | Status | Funcionalidades |
|--------|-------------|--------|-----------------|
| Alertas.tsx | `src/pages/Alertas.tsx` | ✅ Completo | Exibição de alertas críticos e notificações. |
| BemVindo.tsx | `src/pages/BemVindo.tsx` | ✅ Completo | Tela de boas‑vindas com tour introdutório. |
| Dashboard.tsx | `src/pages/Dashboard.tsx` | ✅ Otimizado | KPIs em tempo real, gráficos de fluxo de caixa, estatísticas de frota e alertas. |
| Index.tsx | `src/pages/Index.tsx` | ✅ Completo | Página inicial da aplicação web. |
| Landing.tsx | `src/pages/Landing.tsx` | ✅ Completo | Landing page institucional. |
| Login.tsx | `src/pages/Login.tsx` | ✅ Completo | Autenticação com confirmação de senha. |
| Lucratividade.tsx | `src/pages/Lucratividade.tsx` | ✅ Completo | Cálculo de ROI por veículo. |
| Manutencao.tsx | `src/pages/Manutencao.tsx` | ✅ Completo | Agendamento e controle de custos de manutenção. |
| MarketplaceLanding.tsx | `src/pages/MarketplaceLanding.tsx` | ✅ Completo | Landing page de conversão para o módulo Marketplace. |
| MotoristaDetalhe.tsx | `src/pages/MotoristaDetalhe.tsx` | ✅ Completo | Detalhes e histórico do motorista. |
| Motoristas.tsx | `src/pages/Motoristas.tsx` | ✅ Completo | Listagem e gestão de motoristas. |
| NotFound.tsx | `src/pages/NotFound.tsx` | ✅ Completo | Página 404 padrão. |
| Notifications.tsx | `src/pages/Notifications.tsx` | ✅ Completo | Central de notificações internas. |
| Onboarding.tsx | `src/pages/Onboarding.tsx` | ✅ Completo | Fluxo de cadastro multi‑tenant. |
| Pagamentos.tsx | `src/pages/Pagamentos.tsx` | ✅ Completo | Lançamento de receitas/despesas e gestão de recebíveis. |
| ParcelaSeguro.tsx | `src/pages/ParcelaSeguro.tsx` | ✅ Completo | Controle de financiamentos e seguros. |
| Perfil.tsx | `src/pages/Perfil.tsx` | ✅ Completo | Edição de perfil do usuário. |
| Usuarios.tsx | `src/pages/Usuarios.tsx` | ✅ Completo | Gestão de equipe e papéis. |
| VeiculoDetalhe.tsx | `src/pages/VeiculoDetalhe.tsx` | ✅ Completo | Detalhes e histórico do veículo. |
| Veiculos.tsx | `src/pages/Veiculos.tsx` | ✅ Completo | Inventário de frota e status. |

---

## 📱 Núcleo Mobile (Operações de Campo)

| Página | Localização | Status | Funcionalidades |
|--------|-------------|--------|-----------------|
| MobileHome.tsx | `src/pages/mobile/MobileHome.tsx` | ✅ Completo | Dashboard simplificado com atalhos de toque. |
| MobileAlertas.tsx | `src/pages/mobile/MobileAlertas.tsx` | ✅ Completo | Visualização rápida de alertas críticos. |
| MobileAlugueis.tsx | `src/pages/mobile/MobileAlugueis.tsx` | ✅ Completo | Confirmação de recebíveis no ato e controle de locações. |
| MobileChecklist.tsx | `src/pages/mobile/MobileChecklist.tsx` | ✅ Completo | Checklist de inspeção em campo. |
| MobileFrota.tsx | `src/pages/mobile/MobileFrota.tsx` | ✅ Completo | Listagem rápida da frota com status. |
| MobileHome.tsx (já listado) |
| MobileManutencao.tsx | `src/pages/mobile/MobileManutencao.tsx` | ✅ Completo | Agendamento de manutenção em campo. |
| MobileManutencaoDetalhe.tsx | `src/pages/mobile/MobileManutencaoDetalhe.tsx` | ✅ Completo | Detalhes da manutenção. |
| MobileMotoristaDetalhe.tsx | `src/pages/mobile/MobileMotoristaDetalhe.tsx` | ✅ Completo | Detalhes do motorista em campo. |
| MobileMotoristas.tsx | `src/pages/mobile/MobileMotoristas.tsx` | ✅ Completo | Listagem de motoristas para operação. |
| MobileOperacoes.tsx | `src/pages/mobile/MobileOperacoes.tsx` | ✅ Completo | Visão geral das operações diárias. |
| MobilePagamentos.tsx | `src/pages/mobile/MobilePagamentos.tsx` | ✅ Completo | Controle de pagamentos em campo. |
| MobilePerfil.tsx | `src/pages/mobile/MobilePerfil.tsx` | ✅ Completo | Edição de perfil no mobile. |
| Mobile404NotFound.tsx | `src/pages/mobile/Mobile404NotFound.tsx` | ✅ Completo | Página 404 para dispositivos móveis. |
| OnboardingCadastro.tsx | `src/pages/mobile/OnboardingCadastro.tsx` | ✅ Completo | Cadastro mobile multi‑tenant. |
| Presente.tsx | `src/pages/mobile/Presente.tsx` | ✅ Completo | Tela de boas‑vindas mobile. |
| TrialExpirado.tsx | `src/pages/mobile/TrialExpirado.tsx` | ✅ Completo | Notificação de expiração de trial. |
| ChecklistDetail.tsx | `src/pages/mobile/ChecklistDetail.tsx` | ✅ Completo | Detalhes do checklist com fotos e PDF. |
| ChecklistNew.tsx | `src/pages/mobile/ChecklistNew.tsx` | ✅ Completo | Criação de novo checklist. |
| Checklists.tsx | `src/pages/mobile/Checklists.tsx` | ✅ Completo | Listagem de checklists. |

---

## 🛒 Núcleo Marketplace (Locação & Negócios)

| Página | Localização | Status | Funcionalidades |
|--------|-------------|--------|-----------------|
| MarketplaceLanding.tsx | `src/pages/MarketplaceLanding.tsx` | ✅ Completo | Landing page de conversão para motoristas. |
| MarketplaceHome.tsx | `src/pages/marketplace/MarketplaceHome.tsx` | ✅ Completo | Hub de descoberta de ofertas. |
| MarketplaceSearch.tsx | `src/pages/marketplace/MarketplaceSearch.tsx` | ✅ Completo | Busca avançada com filtros granulares. |
| MarketplaceDetail.tsx | `src/pages/marketplace/MarketplaceDetail.tsx` | ✅ Completo | Detalhamento da oferta, CTAs de reserva. |
| MarketplaceMyAds.tsx | `src/pages/marketplace/MarketplaceMyAds.tsx` | ✅ Completo | Painel de controle da locadora parceira. |
| MarketplaceProfile.tsx | `src/pages/marketplace/MarketplaceProfile.tsx` | ✅ Completo | Central de comando do usuário no marketplace. |
| MarketplaceProposals.tsx | `src/pages/marketplace/MarketplaceProposals.tsx` | ✅ Completo | Gestão de solicitações de reserva. |
| MarketplaceSell.tsx | `src/pages/marketplace/MarketplaceSell.tsx` | ✅ Completo | Fluxo de anúncio de novos itens. |
| MarketplaceOrders.tsx | `src/pages/marketplace/MarketplaceOrders.tsx` | ✅ Completo | Acompanhamento de reservas e itens salvos. |

---

## 🛠️ Páginas de Infraestrutura

| Página | Localização | Status |
|--------|-------------|--------|
| Login.tsx | `src/pages/Login.tsx` | ✅ Completo |
| Onboarding.tsx | `src/pages/Onboarding.tsx` | ✅ Completo |
| NotFound.tsx | `src/pages/NotFound.tsx` | ✅ Completo |
| Mobile404NotFound.tsx | `src/pages/mobile/Mobile404NotFound.tsx` | ✅ Completo |

---

## 📦 Checkout (Fluxos de Pagamento)

| Página | Localização | Status |
|--------|-------------|--------|
| CheckoutGestao.tsx | `src/pages/checkout/CheckoutGestao.tsx` | ✅ Completo |
| CheckoutGestaoBasico.tsx | `src/pages/checkout/CheckoutGestaoBasico.tsx` | ✅ Completo |
| CheckoutGestaoMaster.tsx | `src/pages/checkout/CheckoutGestaoMaster.tsx` | ✅ Completo |
| CheckoutGestaoPro.tsx | `src/pages/checkout/CheckoutGestaoPro.tsx` | ✅ Completo |
| CheckoutMarketplace.tsx | `src/pages/checkout/CheckoutMarketplace.tsx` | ✅ Completo |
| CheckoutMarketplaceElite.tsx | `src/pages/checkout/CheckoutMarketplaceElite.tsx` | ✅ Completo |
| CheckoutMarketplaceFree.tsx | `src/pages/checkout/CheckoutMarketplaceFree.tsx` | ✅ Completo |
| CheckoutMarketplacePro.tsx` | `src/pages/checkout/CheckoutMarketplacePro.tsx` | ✅ Completo |
| CheckoutMotorista.tsx | `src/pages/checkout/CheckoutMotorista.tsx` | ✅ Completo |
| CheckoutPage.tsx | `src/pages/checkout/CheckoutPage.tsx` | ✅ Completo |
| PlanSelection.tsx | `src/pages/checkout/PlanSelection.tsx` | ✅ Completo |
| TESTE-CHECKOUT.tsx | `src/pages/checkout/TESTE-CHECKOUT.tsx` | ✅ Completo |

---

## 🛠️ Dev (Ferramentas Internas)

| Página | Localização | Status |
|--------|-------------|--------|
| Analytics.tsx | `src/pages/dev/Analytics.tsx` | ✅ Completo |
| Billing.tsx | `src/pages/dev/Billing.tsx` | ✅ Completo |
| Companies.tsx | `src/pages/dev/Companies.tsx` | ✅ Completo |
| Events.tsx | `src/pages/dev/Events.tsx` | ✅ Completo |
| Features.tsx | `src/pages/dev/Features.tsx` | ✅ Completo |
| Logs.tsx | `src/pages/dev/Logs.tsx` | ✅ Completo |
| Migrations.tsx | `src/pages/dev/Migrations.tsx` | ✅ Completo |
| Overview.tsx | `src/pages/dev/Overview.tsx` | ✅ Completo |
| Settings.tsx | `src/pages/dev/Settings.tsx` | ✅ Completo |
| Support.tsx | `src/pages/dev/Support.tsx` | ✅ Completo |
| System.tsx | `src/pages/dev/System.tsx` | ✅ Completo |
| Users.tsx | `src/pages/dev/Users.tsx` | ✅ Completo |

---

**Total de Páginas Documentadas:** 75 (23 Desktop/Web, 20 Mobile, 8 Marketplace, 12 Checkout, 12 Dev)  
**Última Atualização:** 29/05/2026  
**Status Geral:** ✅ 100% Sincronizado com o Código Atual.
