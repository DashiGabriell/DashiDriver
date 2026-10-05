# Roles de Acesso — DashiDrive

Este documento define as funções (roles) de usuários na plataforma, garantindo a segurança e o controle de acesso baseado em privilégios (RBAC) e isolamento por locadora. O acesso a funcionalidades específicas por essas roles é condicionado ao plano de assinatura contratado.

## 1. Nível de Sistema (Global)
Usuários com acesso a toda a plataforma.

| Role | Descrição |
| :--- | :--- |
| `DASHI_ADMIN` | Acesso total à infraestrutura da plataforma (gestão de tenants, billing global). |
| `DASHI` | Acesso técnico para manutenção, suporte avançado e diagnóstico. |

---

## 2. Nível de Locadora (SaaS/Gestão)
Usuários vinculados a uma empresa (tenant).

| Role | Acesso | Descrição |
| :--- | :--- | :--- |
| `ADMIN` | Total | Configurações de locadora, finanças, frota, equipe e planos. |
| `GERENTE` | Operacional | Frota, manutenção, checklists e relatórios. (Sem acesso a configurações de billing). |
| `OPERACIONAL` | Campo | Apenas checklists e status de veículos. (Uso mobile intensivo). |
| `AUDITOR` | Leitura | Visualização de relatórios e histórico de frota (Read-only). |

### Matriz de Acesso por Plano (Gestão)

| Recurso / Plano | BÁSICO (R$ 199) | PRO (R$ 399) | MASTER (R$ 799) |
| :--- | :--- | :--- | :--- |
| **Limite Frota** | 5 veículos | 20 veículos | 100 veículos |
| **Usuários** | 1 Admin | 3 (Admin/User) | 200 |
| **Financeiro Avançado** | Não | Sim | Sim |
| **Manutenção** | Não | Sim | Sim |
| **Alertas Inteligentes** | Não | Sim | Sim |
| **Multi-equipe** | Não | Não | Sim |

---

## 3. Nível de Marketplace
Usuários focados no ecossistema de anúncios.

| Role | Acesso | Descrição |
| :--- | :--- | :--- |
| `LOCADOR` | Marketplace | Publica anúncios, gere propostas recebidas e visualiza métricas de exposição. |
| `MOTORISTA` | Marketplace | Busca veículos, envia propostas de locação e gere seu histórico. |

### Matriz de Acesso por Plano (Marketplace)

| Recurso / Plano | FREE (R$ 0) | PRO (R$ 119) | ELITE (R$ 299) |
| :--- | :--- | :--- | :--- |
| **Anúncios Ativos** | 1 | 10 | 25 |
| **Métricas** | Não | Básicas | Completas |
| **Visibilidade** | Padrão | Padrão | Destaque/Prioridade |
| **Perfil Verificado** | Não | Sim | Sim (Visual Premium) |

---
*Nota: A aplicação utiliza RLS (Row Level Security) e vinculação total com a `company_id` para garantir que usuários acessem apenas os dados de sua respectiva locadora, respeitando os limites do plano assinado.*
