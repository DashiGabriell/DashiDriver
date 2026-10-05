# 📑 ÍNDICE RÁPIDO — Páginas da DashiDrive (75+)

**Formato:** Referência rápida de todas as páginas por categoria

---

## 1️⃣ DESKTOP — PÁGINAS DE GESTÃO CORE (Main App)

### 1.1 Dashboard & Analítica (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Dashboard | `src/pages/Dashboard.tsx` | KPIs, gráficos, status frota |
| Dashboard Backup | `src/pages/Dashboard.tsx.backup` | Versão anterior (não usar) |

### 1.2 Gestão de Frota — Veículos (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Lista de Veículos | `src/pages/Veiculos.tsx` | CRUD, filtro, status |
| Detalhe do Veículo | `src/pages/VeiculoDetalhe.tsx` | Histórico, documentos, financeiro |

### 1.3 Gestão de Motoristas (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Lista de Motoristas | `src/pages/Motoristas.tsx` | Registro, inadimplência, status |
| Detalhe do Motorista | `src/pages/MotoristaDetalhe.tsx` | Perfil, locações, CPF/CNH |

### 1.4 Controle Financeiro (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Pagamentos | `src/pages/Pagamentos.tsx` | Receitas, despesas, histórico |
| Parcela de Seguro | `src/pages/ParcelaSeguro.tsx` | Financiamentos, seguros, vencimentos |
| Lucratividade | `src/pages/Lucratividade.tsx` | Análise comparativa por veículo |

### 1.5 Manutenção & Oficina (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Manutenção | `src/pages/Manutencao.tsx` | Agendamento, custos, histórico |

### 1.6 Vistorias & Checklists (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Lista de Checklists | `src/pages/Checklists.tsx` | Histórico de vistorias |
| Novo Checklist | `src/pages/ChecklistNew.tsx` | Criar vistoria (tipo, fotos) |
| Detalhe Checklist | `src/pages/ChecklistDetail.tsx` | Fotos, notas, PDF, compartilhar |

### 1.7 Alertas & Notificações (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Alertas | `src/pages/Alertas.tsx` | Prioridades, status, histórico |
| Notificações | `src/pages/Notifications.tsx` | Central de notificações em tempo real |

### 1.8 Gestão de Usuários & Configuração (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Usuários | `src/pages/Usuarios.tsx` | Equipe, roles, permissões |
| Perfil | `src/pages/Perfil.tsx` | Dados pessoais, empresa, settings |

---

## 2️⃣ MOBILE — CAMPO & OPERAÇÕES (Mobile App)

**Localização:** `src/pages/mobile/`

### 2.1 Navegação & Home (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Home Mobile | `mobile/MobileHome.tsx` | Dashboard mobile otimizado |

### 2.2 Frota Mobile (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Frota Mobile | `mobile/MobileFrota.tsx` | Lista de veículos otimizada |

### 2.3 Motoristas Mobile (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Motoristas Mobile | `mobile/MobileMotoristas.tsx` | Lista de motoristas |
| Detalhe Motorista | `mobile/MobileMotoristaDetalhe.tsx` | Card de motorista |

### 2.4 Operações & Pagamentos (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Operações | `mobile/MobileOperacoes.tsx` | Atalhos rápidos |
| Pagamentos Mobile | `mobile/MobilePagamentos.tsx` | Confirmar pagamentos |

### 2.5 Manutenção Mobile (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Manutenção Mobile | `mobile/MobileManutencao.tsx` | Listar manutenções |
| Nova Manutenção | `mobile/MobileManutencaoNew.tsx` | Criar no campo |
| Detalhe Manutenção | `mobile/MobileManutencaoDetalhe.tsx` | Visualizar |

### 2.6 Checklists Mobile (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Checklist Mobile | `mobile/MobileChecklist.tsx` | Criar vistoria mobile |
| Compare Checklist | `mobile/ChecklistCompare.tsx` | Comparar duas vistorias |
| Detalhe Checklist | `mobile/ChecklistDetail.tsx` | Visualizar vistoria |

### 2.7 Alertas Mobile (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Alertas Mobile | `mobile/MobileAlertas.tsx` | Alertas críticos em card |

### 2.8 Aluguéis Mobile (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Aluguéis Mobile | `mobile/MobileAlugueis.tsx` | Histórico de locações |

### 2.9 Perfil Mobile (1 página)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Perfil Mobile | `mobile/MobilePerfil.tsx` | Dados pessoais |

### 2.10 Onboarding & Exceções (4 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Onboarding Cadastro | `mobile/OnboardingCadastro.tsx` | Criar empresa |
| 404 Mobile | `mobile/Mobile404NotFound.tsx` | Página não encontrada |
| Trial Expirado | `mobile/TrialExpirado.tsx` | Trial venceu |
| Pagamento Pendente | `mobile/PagamentoPendente.tsx` | Bloqueio de acesso |
| Presente | `mobile/Presente.tsx` | Página de apresentação |

---

## 3️⃣ MARKETPLACE — ECOSSISTEMA B2B (Novo - Maio 2026)

**Localização:** `src/pages/marketplace/`

### 3.1 Para Motoristas (Seekers) (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Home Marketplace | `marketplace/MarketplaceHome.tsx` | Destaque de anúncios |
| Buscar | `marketplace/MarketplaceSearch.tsx` | Busca avançada com filtros |
| Detalhe Anúncio | `marketplace/MarketplaceDetail.tsx` | Caução, franquia, proposta |
| Perfil | `marketplace/MarketplaceProfile.tsx` | Histórico, avaliações |

### 3.2 Para Locadoras (Providers) (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Meus Anúncios | `marketplace/MarketplaceMyAds.tsx` | Dashboard de performance |
| Criar Anúncio | `marketplace/MarketplaceSell.tsx` | Upload, detalhes, preços |
| Propostas | `marketplace/MarketplaceProposals.tsx` | Análise, aceitar/rejeitar |
| Ordens | `marketplace/MarketplaceOrders.tsx` | Histórico de locações |

### 3.3 Inspeções Marketplace (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Inspeção | `marketplace/Inspection.tsx` | Vistoria rápida antes de liberar |
| Lista Inspeções | `marketplace/InspectionsList.tsx` | Histórico de inspeções |

---

## 4️⃣ LOJISTA — PORTAL DE VENDEDOR

**Localização:** `src/pages/lojista/`

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Portal do Lojista | `lojista/PortaldoLojista.tsx` | Hub central |
| Analytics | `lojista/Analytics.tsx` | Estatísticas |
| Assinatura | `lojista/Assinatura.tsx` | Gestão de plano |
| Configurações | `lojista/Configuracoes.tsx` | Settings |
| Meu Estoque | `lojista/MeuEstoque.tsx` | Peças/acessórios |
| Novo Veículo | `lojista/NovoVeiculo.tsx` | Listar no marketplace |
| Oportunidades | `lojista/Oportunidades.tsx` | Demandas recebidas |
| Perfil | `lojista/Perfil.tsx` | Perfil público |
| Detalhe Veículo | `lojista/VeiculoDetalhe.tsx` | Detalhes do anúncio |

---

## 5️⃣ DEV — PAINEL ADMINISTRATIVO INTERNO

**Localização:** `src/pages/dev/` (⚠️ Restritos a DASHI_ADMIN, DASHI)

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Overview | `dev/Overview.tsx` | Métricas globais |
| Companies | `dev/Companies.tsx` | Gestão de tenants |
| Users | `dev/Users.tsx` | Usuários globais |
| Billing | `dev/Billing.tsx` | Faturamento |
| Analytics | `dev/Analytics.tsx` | MAU, churn, LTV |
| Logs | `dev/Logs.tsx` | Auditoria |
| System | `dev/System.tsx` | Health check |
| Features | `dev/Features.tsx` | Feature flags |
| Migrations | `dev/Migrations.tsx` | Histórico BD |
| Support | `dev/Support.tsx` | Suporte técnico |
| Events | `dev/Events.tsx` | Eventos de sistema |
| Plan Manager | `dev/PlanManager.tsx` | Gestão de planos |
| Security | `dev/Security.tsx` | Monitoramento segurança |
| Settings | `dev/Settings.tsx` | Config globais |
| WhatsApp | `dev/WhatsApp.tsx` | Integração WhatsApp |
| Broadcast | `dev/Broadcast.tsx` | Mensagens broadcast |
| Coupons | `dev/Coupons.tsx` | Gestão de cupons |
| Webhook Test | `dev/WebhookTest.tsx` | Teste de webhooks |
| Veículos | `dev/Veiculos.tsx` | Consulta global |

---

## 6️⃣ CHECKOUT — PÁGINAS DE PAGAMENTO

**Localização:** `src/pages/checkout/`

### 6.1 Seleção de Planos (2 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Seleção de Planos | `checkout/PlanSelection.tsx` | Comparativo de planos |
| Planos Page | `checkout/PlanosPage.tsx` | Landing de planos |

### 6.2 Checkout — Planos Gestão (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Básico (R$ 199) | `checkout/CheckoutGestaoBasico.tsx` | 5 veículos |
| Pro (R$ 399) | `checkout/CheckoutGestaoPro.tsx` | 20 veículos |
| Master (R$ 799) | `checkout/CheckoutGestaoMaster.tsx` | 100 veículos |

### 6.3 Checkout — Planos Marketplace (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Free (R$ 0) | `checkout/CheckoutMarketplaceFree.tsx` | 1 anúncio |
| Pro (R$ 119) | `checkout/CheckoutMarketplacePro.tsx` | 10 anúncios |
| Elite (R$ 299) | `checkout/CheckoutMarketplaceElite.tsx` | 25 anúncios |

### 6.4 Checkout Especiais (3 páginas)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Motorista | `checkout/CheckoutMotorista.tsx` | Checkout para motorista |
| Genérico | `checkout/CheckoutPage.tsx` | Wrapper genérico |
| Teste | `checkout/TESTE-CHECKOUT.tsx` | Sandbox |

---

## 7️⃣ AJUDA — DOCUMENTAÇÃO INTERATIVA

**Localização:** `src/pages/ajuda/`

### 7.1 Ajuda Gestão (`ajuda/gestao/`)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Hub | `ajuda/gestao/Index.tsx` | Centro de ajuda |
| Veículos | `ajuda/gestao/Veiculos.tsx` | Como gerenciar |
| Motoristas | `ajuda/gestao/Motoristas.tsx` | Como usar |
| Checklists | `ajuda/gestao/Checklists.tsx` | Vistorias |
| Pagamentos | `ajuda/gestao/Pagamentos.tsx` | Financeiro |
| Seguro | `ajuda/gestao/FinanciamentoSeguro.tsx` | Parcelas |
| Manutenção | `ajuda/gestao/Manutencao.tsx` | Oficina |
| Lucratividade | `ajuda/gestao/Lucratividade.tsx` | Análise |
| Alertas | `ajuda/gestao/Alertas.tsx` | Notificações |
| Usuários | `ajuda/gestao/Usuarios.tsx` | Equipe |
| Perfil | `ajuda/gestao/Perfil.tsx` | Configurações |

### 7.2 Ajuda Lojista (`ajuda/lojista/`)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Hub | `ajuda/lojista/Index.tsx` | Centro de ajuda |
| Hub Avançado | `ajuda/lojista/Hub.tsx` | Detalhado |
| Analytics | `ajuda/lojista/Analytics.tsx` | Estatísticas |
| Assinatura | `ajuda/lojista/Assinatura.tsx` | Planos |
| Configurações | `ajuda/lojista/Configuracoes.tsx` | Settings |
| Estoque | `ajuda/lojista/Estoque.tsx` | Peças |
| Novo Veículo | `ajuda/lojista/NovoVeiculo.tsx` | Anúncio |
| Oportunidades | `ajuda/lojista/Oportunidades.tsx` | Demandas |
| Perfil | `ajuda/lojista/Perfil.tsx` | Perfil público |
| Detalhe | `ajuda/lojista/VeiculoDetalhe.tsx` | Anúncio detalhado |

### 7.3 Ajuda Marketplace (`ajuda/marketplace/`)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Hub | `ajuda/marketplace/Index.tsx` | Centro de ajuda |
| Home | `ajuda/marketplace/Home.tsx` | Como procurar |
| Buscar | `ajuda/marketplace/Buscar.tsx` | Filtros |
| Detalhes | `ajuda/marketplace/Detalhes.tsx` | Entendendo |
| Favoritos | `ajuda/marketplace/Favoritos.tsx` | Wishlist |
| Inspeção | `ajuda/marketplace/Inspecao.tsx` | Vistoria |
| Inspeções | `ajuda/marketplace/ListaInspecoes.tsx` | Histórico |
| Meus Anúncios | `ajuda/marketplace/MeusAnuncios.tsx` | Gestão |
| Anunciar | `ajuda/marketplace/Anunciar.tsx` | Como criar |
| Perfil | `ajuda/marketplace/Perfil.tsx` | Perfil |
| Propostas | `ajuda/marketplace/Propostas.tsx` | Propostas |

### 7.4 Ajuda Motorista (`ajuda/motorista/`)
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Hub | `ajuda/motorista/Index.tsx` | Centro de ajuda |
| Início | `ajuda/motorista/Inicio.tsx` | Boas-vindas |
| Frota | `ajuda/motorista/Frota.tsx` | Veículos |
| Motoristas | `ajuda/motorista/Motoristas.tsx` | Relacionamento |
| Checklists | `ajuda/motorista/Checklists.tsx` | Vistorias |
| Manutenção | `ajuda/motorista/Manutencao.tsx` | Officina |
| Pagamentos | `ajuda/motorista/Pagamentos.tsx` | Financeiro |
| Aluguéis | `ajuda/motorista/Alugueis.tsx` | Locações |
| Alertas | `ajuda/motorista/Alertas.tsx` | Notificações |
| Perfil | `ajuda/motorista/Perfil.tsx` | Configurações |

---

## 8️⃣ PÁGINAS ESPECIAIS (Landing, Auth, Onboarding)

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Index | `pages/Index.tsx` | Homepage/Dashboard público |
| Landing | `pages/Landing.tsx` | Marketing principal |
| Marketplace Landing | `pages/MarketplaceLanding.tsx` | Marketing marketplace |
| Login | `pages/Login.tsx` | Autenticação |
| Onboarding | `pages/Onboarding.tsx` | Cadastro de empresa |
| Bem Vindo | `pages/BemVindo.tsx` | Boas-vindas |
| Accept Invite | `pages/AcceptInvite.tsx` | Aceitar convite |
| Vistoria Compartilhada | `pages/VistoriaCompartilhada.tsx` | Visualizar sem login |
| 404 | `pages/NotFound.tsx` | Página não encontrada |

---

## 📊 RESUMO ESTATÍSTICO

```
TOTAL DE PÁGINAS: 75+

Distribuição:
├── Desktop (Gestão)      11 páginas
├── Mobile (Campo)        15 páginas
├── Marketplace           8 páginas
├── Lojista              9 páginas
├── Dev (Admin)          19 páginas
├── Checkout            8 páginas
├── Ajuda               43 páginas (11 + 10 + 11 + 10)
└── Especiais           9 páginas

Layouts Únicos: 5
├── Desktop Layout (sidebar completo)
├── Mobile Layout (bottom nav + header)
├── Marketplace Layout (header especial)
├── Dev Layout (internal admin)
└── Ajuda Layout (documentação)

Funcionalidades Cobertas:
✅ ERP Completo (Frota, Motoristas, Financeiro, Manutenção)
✅ Vistorias & Checklists (Mobile-first)
✅ Marketplace B2B (3 categorias, 3 planos)
✅ Checkout & Pagamentos (Asaas integrado)
✅ Multi-tenant & Segurança (RLS, RBAC)
✅ Admin Panel (Dev tools, 19 páginas)
✅ Ajuda Interativa (43 páginas de documentação)
```

---

**Documento de Referência Rápida**  
Última Atualização: 22 de Junho de 2026
