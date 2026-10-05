---
name: squaddashi
description: Squad Dashi - Toolkit completo para Agrofruta Insights. Reúne as melhores ferramentas de segurança, performance, clean-code, design, front-end, back-end, banco de dados e mobile. Orientação estratégica para desenvolvimento de alta qualidade.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 1.0.0
priority: HIGH
---

# 🌾 Squad Dashi - Agrofruta Insights Toolkit

![Agrofruta Logo](../../public/logo.png)

> **Toolkit Estratégico para Desenvolvimento de Alta Qualidade**
> 
> Reúne as melhores ferramentas, padrões e práticas para orientar o desenvolvimento do Agrofruta Insights com foco em segurança, performance, clean-code, design, front-end, back-end, banco de dados e mobile.

---

## 📋 Visão Geral

O **Squad Dashi** é um guia integrado que consolida:

- ✅ **19 Especialistas** - Agentes especializados por domínio
- ✅ **36 Skills** - Módulos de conhecimento reutilizáveis
- ✅ **11 Workflows** - Procedimentos de automação
- ✅ **2 Scripts Mestres** - Validação contínua
- ✅ **18+ Scripts Especializados** - Verificação por domínio

---

## 🎯 Stack do Projeto: Agrofruta Insights

### Frontend
- **Framework:** React 18.3 + Vite
- **Roteamento:** React Router v6
- **UI Components:** shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS v3
- **Animações:** Framer Motion
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Temas:** next-themes (dark mode)
- **Notificações:** Sonner
- **Ícones:** Lucide React

### Backend
- **Runtime:** Node.js (ESM)
- **Validação:** Zod
- **Requisições:** React Query (TanStack)

### Qualidade
- **Linting:** ESLint 9
- **TypeScript:** 5.8
- **Testes:** Vitest
- **Build:** Vite 5

---

## 🔐 1. SEGURANÇA (CRÍTICO)

### Skill Principal: `vulnerability-scanner`

**Quando usar:** Antes de cada deploy, após adicionar dependências, em PRs

#### Checklist de Segurança

- [ ] **Scan de Vulnerabilidades**
  ```bash
  python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
  ```
  - OWASP Top 10:2025
  - Detecção de secrets
  - Análise de dependências
  - Supply Chain Security

- [ ] **Dependências Auditadas**
  ```bash
  npm audit --audit-level=high
  ```
  - Sem vulnerabilidades críticas
  - Versões pinadas
  - Lock files commitados

- [ ] **Secrets Management**
  - Nenhum token/chave em código
  - Usar `.env.local` (gitignored)
  - Variáveis de ambiente para produção

- [ ] **HTTPS & Headers**
  - HTTPS em produção
  - Security headers configurados
  - CORS restritivo

### Princípios de Segurança

| Princípio | Aplicação |
|-----------|-----------|
| **Zero Trust** | Validar TUDO, nunca confiar |
| **Least Privilege** | Acesso mínimo necessário |
| **Defense in Depth** | Múltiplas camadas de proteção |
| **Fail Secure** | Em erro, negar acesso |

---

## ⚡ 2. PERFORMANCE (CRÍTICO)

### Skill Principal: `performance-profiling`

**Quando usar:** Após mudanças significativas, antes de deploy, em PRs

#### Core Web Vitals (Targets)

| Métrica | Target | Status |
|---------|--------|--------|
| **LCP** (Loading) | < 2.5s | ⏳ |
| **INP** (Interactivity) | < 200ms | ⏳ |
| **CLS** (Stability) | < 0.1 | ⏳ |

#### Checklist de Performance

- [ ] **Lighthouse Audit**
  ```bash
  python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:5173
  ```
  - Score > 90
  - Core Web Vitals green
  - Sem warnings críticos

- [ ] **Bundle Analysis**
  - Tamanho < 200KB (gzipped)
  - Sem duplicatas de dependências
  - Code splitting por rota

- [ ] **Runtime Performance**
  - Sem long tasks (>50ms)
  - Smooth scrolling (60fps)
  - Sem memory leaks

---

## 🧹 3. CLEAN CODE (CRÍTICO)

### Skill Principal: `clean-code`

**Quando usar:** Em TODA mudança de código

#### Princípios Fundamentais

| Princípio | Regra |
|-----------|-------|
| **SRP** | Uma responsabilidade por função/componente |
| **DRY** | Não repetir código, extrair duplicatas |
| **KISS** | Solução mais simples que funciona |
| **YAGNI** | Não construir features não usadas |
| **Boy Scout** | Deixar código mais limpo que encontrou |

#### Checklist de Clean Code

- [ ] **Nomes Claros**
  - Variáveis revelam intenção: `userCount` não `n`
  - Funções: verbo + substantivo: `getUserById()`
  - Booleanos: forma de pergunta: `isActive`, `hasPermission`

- [ ] **Funções Pequenas**
  - Máximo 20 linhas
  - Idealmente 5-10 linhas
  - Uma coisa, bem feita

- [ ] **Lint & Types**
  ```bash
  npm run lint
  npx tsc --noEmit
  ```
  - Zero erros de lint
  - 100% type coverage

---

## 🎨 4. DESIGN & UX (ALTO)

### Skill Principal: `frontend-design`

**Quando usar:** Ao criar/modificar componentes, páginas, layouts

#### Princípios de Design

| Princípio | Aplicação |
|-----------|-----------|
| **Constraint Analysis** | Entender timeline, conteúdo, brand, tech |
| **UX Psychology** | Hick's Law, Fitts' Law, Von Restorff |
| **60-30-10 Rule** | 60% base, 30% secundário, 10% accent |
| **Whitespace** | Respiração visual, luxo |
| **Hierarchy** | Tamanho, cor, posição guiam atenção |

#### Checklist de Design

- [ ] **UX Audit**
  ```bash
  python .agent/skills/frontend-design/scripts/ux_audit.py .
  ```

- [ ] **Accessibility Check**
  ```bash
  python .agent/skills/frontend-design/scripts/accessibility_checker.py .
  ```

- [ ] **Design System Consistente**
  - Cores: 60-30-10 rule
  - Typography: escala harmônica
  - Spacing: múltiplos de 8px
  - Componentes reutilizáveis

---

## 🚀 5. FRONT-END (ALTO)

### Skill Principal: `react-patterns`

**Quando usar:** Ao criar componentes, páginas, lógica de UI

#### Stack React Agrofruta

```
React 18.3 (Latest)
├── Server Components (quando possível)
├── Client Components (interatividade)
├── Hooks (useState, useEffect, useContext)
├── React Query (data fetching)
└── React Router (navegação)
```

#### Checklist de React

- [ ] **Componentes Bem Estruturados**
  - Uma responsabilidade por componente
  - Props tipadas com TypeScript
  - Composição sobre props drilling

- [ ] **State Management**
  - Local state: `useState`
  - Compartilhado: Context API
  - Server state: React Query

- [ ] **Performance**
  - `React.memo` para componentes puros
  - `useCallback` para callbacks estáveis
  - Lazy loading de rotas

---

## 🔌 6. BACK-END (MÉDIO-ALTO)

### Skill Principal: `nodejs-best-practices`

**Quando usar:** Ao criar APIs, serviços, lógica de negócio

#### Arquitetura Recomendada

```
Se precisar de backend:
├── Framework: Hono (edge) ou Express (tradicional)
├── Validação: Zod (já usado no frontend)
├── ORM: Prisma (type-safe)
├── Auth: JWT ou OAuth
└── Deployment: Vercel, Railway, ou Fly.io
```

---

## 🗄️ 7. BANCO DE DADOS (MÉDIO)

### Skill Principal: `database-design`

**Quando usar:** Ao planejar schema, migrations, queries

#### Stack de Banco de Dados

```
Opções por caso de uso:
├── PostgreSQL (Neon) - Produção, relacional
├── SQLite - Desenvolvimento local
├── Prisma - ORM type-safe
└── Drizzle - Alternativa leve
```

---

## 📱 8. MOBILE (MÉDIO)

### Skill Principal: `mobile-design`

**Quando usar:** Se expandir para mobile (React Native, Flutter)

#### Princípios Mobile

| Princípio | Aplicação |
|-----------|-----------|
| **Touch-First** | Targets ≥ 44-48px |
| **Thumb Zone** | CTAs na base da tela |
| **Offline-Ready** | Funciona sem rede |
| **Battery-Conscious** | Otimizado para bateria |

---

## ✅ 9. TESTES (ALTO)

### Skill Principal: `testing-patterns`

**Quando usar:** Ao implementar features, antes de merge

#### Pirâmide de Testes

```
        /\          E2E (Poucos)
       /  \         Flows críticos
      /----\
     /      \       Integration (Alguns)
    /--------\      APIs, DB
   /          \
  /------------\    Unit (Muitos)
                    Funções, componentes
```

---

## 🔍 10. DEBUGGING (MÉDIO)

### Skill Principal: `systematic-debugging`

**Quando usar:** Ao investigar bugs, issues em produção

#### Metodologia 4-Fases

| Fase | Ação |
|------|------|
| **1. Reproduzir** | Passos exatos para reproduzir |
| **2. Isolar** | Reduzir ao mínimo reproduzível |
| **3. Entender** | Root cause analysis (5 Whys) |
| **4. Verificar** | Fix + teste de regressão |

---

## 📊 11. SEO & ANALYTICS (MÉDIO)

### Skill Principal: `seo-fundamentals`

**Quando usar:** Ao criar landing pages, conteúdo público

#### Checklist de SEO

- [ ] **SEO Check**
  ```bash
  python .agent/skills/seo-fundamentals/scripts/seo_checker.py .
  ```

- [ ] **Core Web Vitals**
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

---

## 🚀 12. DEPLOYMENT (ALTO)

### Skill Principal: `deployment-procedures`

**Quando usar:** Antes de cada release

#### Checklist de Deploy

- [ ] **Pre-Deploy Verification**
  ```bash
  python .agent/scripts/checklist.py .
  python .agent/scripts/verify_all.py . --url http://localhost:5173
  ```

- [ ] **Backup & Rollback**
  - Backup do estado atual
  - Plano de rollback documentado
  - Teste de rollback

---

## 📋 SCRIPTS MESTRES

### Script 1: `checklist.py` (Desenvolvimento)

```bash
python .agent/scripts/checklist.py .
```

**Verifica:** Segurança, Qualidade, Testes, UX, SEO
**Tempo:** ~2-3 minutos

### Script 2: `verify_all.py` (Pré-Deploy)

```bash
python .agent/scripts/verify_all.py . --url http://localhost:5173
```

**Verifica:** Tudo + Performance, E2E, Bundle, Mobile, i18n
**Tempo:** ~5-10 minutos

---

## 🎯 WORKFLOW RECOMENDADO

### Desenvolvimento Diário

1. Criar branch feature
2. Implementar mudanças
3. Rodar: `npm run lint && npm run test`
4. Rodar: `python .agent/scripts/checklist.py .`
5. Commit & Push
6. PR review
7. Merge

### Antes de Deploy

1. Merge para main
2. Build: `npm run build`
3. Rodar: `python .agent/scripts/verify_all.py . --url http://localhost:5173`
4. Revisar relatório
5. Deploy em staging
6. Testes manuais
7. Deploy em produção
8. Monitorar por 15+ minutos

---

## 🤖 AGENTES ESPECIALIZADOS

| Agente | Quando Usar | Skills |
|--------|-------------|--------|
| **frontend-specialist** | UI/UX, componentes | react-patterns, tailwind-patterns, frontend-design |
| **backend-specialist** | APIs, lógica | api-patterns, nodejs-best-practices |
| **database-architect** | Schema, queries | database-design, prisma-expert |
| **security-auditor** | Segurança | vulnerability-scanner, red-team-tactics |
| **performance-optimizer** | Speed, Web Vitals | performance-profiling |
| **test-engineer** | Testes | testing-patterns, webapp-testing |
| **debugger** | Bugs, issues | systematic-debugging |
| **devops-engineer** | Deploy, CI/CD | deployment-procedures, docker-expert |

---

## ✨ RESUMO EXECUTIVO

**Squad Dashi** é seu guia completo para desenvolvimento de alta qualidade no Agrofruta Insights.

### Prioridades

1. 🔐 **Segurança** - Sempre primeiro
2. ⚡ **Performance** - Usuários felizes
3. 🧹 **Clean Code** - Manutenibilidade
4. 🎨 **Design** - Experiência
5. ✅ **Testes** - Confiança

### Próximos Passos

- [ ] Ler `INDEX.md` - Índice completo
- [ ] Ler `README.md` - Como usar
- [ ] Ler `clean-code` - Padrões de código
- [ ] Ler `react-patterns` - Componentes
- [ ] Rodar `checklist.py` - Validação

---

> **Desenvolvido com ❤️ para Agrofruta Insights**
> 
> *Qualidade, segurança e performance em cada linha de código.*
