# 🌾 Squad Dashi - Agrofruta Insights Toolkit

## O que é Squad Dashi?

**Squad Dashi** é um toolkit estratégico e integrado que reúne as melhores ferramentas, padrões e práticas para orientar o desenvolvimento do **Agrofruta Insights** com foco em:

- 🔐 **Segurança** (CRÍTICO)
- ⚡ **Performance** (CRÍTICO)
- 🧹 **Clean Code** (CRÍTICO)
- 🎨 **Design & UX** (ALTO)
- 🚀 **Front-End** (ALTO)
- 🔌 **Back-End** (MÉDIO-ALTO)
- 🗄️ **Banco de Dados** (MÉDIO)
- 📱 **Mobile** (MÉDIO)
- ✅ **Testes** (ALTO)
- 🔍 **Debugging** (MÉDIO)
- 📊 **SEO & Analytics** (MÉDIO)
- 🚀 **Deployment** (ALTO)

---

## Como Usar

### 1. Ler a Skill Completa

```bash
# Abra o arquivo SKILL.md para ver o guia completo
cat .agent/skills/squaddashi/SKILL.md
```

### 2. Usar os Scripts de Validação

#### Desenvolvimento Diário
```bash
# Validação rápida após mudanças
python .agent/scripts/checklist.py .
```

#### Pré-Deploy
```bash
# Validação completa antes de release
python .agent/scripts/verify_all.py . --url http://localhost:5173
```

### 3. Consultar Skills Específicas

Quando precisar de orientação em uma área específica:

```bash
# Segurança
cat .agent/skills/vulnerability-scanner/SKILL.md

# Performance
cat .agent/skills/performance-profiling/SKILL.md

# Clean Code
cat .agent/skills/clean-code/SKILL.md

# React
cat .agent/skills/react-patterns/SKILL.md

# Design
cat .agent/skills/frontend-design/SKILL.md

# Testes
cat .agent/skills/testing-patterns/SKILL.md
```

---

## Stack do Projeto

### Frontend
- React 18.3 + Vite
- React Router v6
- shadcn/ui (Radix UI)
- Tailwind CSS v3
- Framer Motion
- React Hook Form + Zod
- Recharts
- next-themes (dark mode)

### Qualidade
- ESLint 9
- TypeScript 5.8
- Vitest
- Vite 5

---

## Workflow Recomendado

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

## Agentes Especializados

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

## Próximos Passos

- [ ] Ler `SKILL.md` - Guia completo
- [ ] Ler `clean-code` - Padrões de código
- [ ] Ler `react-patterns` - Componentes
- [ ] Ler `frontend-design` - UI/UX
- [ ] Rodar `checklist.py` - Validação
- [ ] Rodar `verify_all.py` - Pré-deploy

---

## Referências

- [React 18 Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS v3](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router v6](https://reactrouter.com)
- [React Query](https://tanstack.com/query)
- [Zod](https://zod.dev)

---

> **Desenvolvido com ❤️ para Agrofruta Insights**
> 
> *Qualidade, segurança e performance em cada linha de código.*
