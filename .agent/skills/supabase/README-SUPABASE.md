# 📚 Skills de Supabase

## 📋 Visão Geral

Esta coleção de skills documenta a configuração completa e testada para estabelecer uma conexão estável com Supabase em aplicações React + TypeScript + Vite. Baseada na implementação bem-sucedida do projeto **AgroFruta Insights**.

## 🎯 Objetivo

Fornecer documentação completa, reproduzível e testada para:
- Configurar conexão estável com Supabase
- Implementar autenticação persistente
- Criar hooks React customizados
- Gerenciar estado com React Query
- Configurar Row Level Security (RLS)
- Realizar operações CRUD eficientes

## 📖 Documentos Disponíveis

### 0. [supabase-executive-summary.md](./supabase-executive-summary.md) 👔
**Resumo Executivo**

Documento para gestores e tomadores de decisão.

**Conteúdo:**
- 📋 O que é Supabase
- 🎯 Por que usar
- 💰 Análise de custo e ROI
- 📊 Casos de uso ideais
- 🏆 Casos de sucesso
- 🔒 Segurança e compliance
- 📈 Escalabilidade
- 🚀 Roadmap de implementação
- ⚠️ Riscos e mitigações
- 🎯 Recomendação final

**Quando usar:** Para apresentar Supabase para stakeholders e decisores

---

### 1. [supabase-connection-setup.md](./supabase-connection-setup.md)
**Guia Completo de Configuração**

Documento principal com passo a passo detalhado para configurar o Supabase do zero.

**Conteúdo:**
- ✅ Instalação de dependências
- ✅ Configuração de variáveis de ambiente
- ✅ Criação do cliente Supabase otimizado
- ✅ Geração de tipos TypeScript
- ✅ Sistema de gerenciamento de sessão
- ✅ Hooks React de autenticação
- ✅ Configuração do Supabase CLI
- ✅ Row Level Security (RLS)
- ✅ Troubleshooting completo
- ✅ Checklist de implementação

**Quando usar:** Ao iniciar um novo projeto ou migrar para Supabase

---

### 2. [supabase-usage-examples.md](./supabase-usage-examples.md)
**Exemplos Práticos de Uso**

Coleção de exemplos de código testados em produção.

**Conteúdo:**
- 🔐 Autenticação (login, registro, logout, reset de senha)
- 📊 Operações CRUD completas (SELECT, INSERT, UPDATE, DELETE)
- 🎣 Hooks React customizados
- 🔔 Realtime subscriptions
- 📁 Storage (upload/download de arquivos)
- 🔍 Queries avançadas
- 🛡️ Tratamento de erros
- 📊 Transações
- 🎯 Boas práticas

**Quando usar:** Durante o desenvolvimento para consultar padrões de implementação

---

### 3. [supabase-quick-reference.md](./supabase-quick-reference.md)
**Referência Rápida**

Cheat sheet com comandos e snippets mais usados.

**Conteúdo:**
- 🚀 Setup inicial
- 🔧 Configuração básica
- 🔐 Comandos de autenticação
- 📊 Operações CRUD resumidas
- 🔍 Filtros disponíveis
- 📁 Operações de Storage
- 🔔 Realtime básico
- 🎣 Hooks React
- 🛡️ RLS básico
- 🔧 Comandos CLI
- 🐛 Troubleshooting rápido

**Quando usar:** Como referência rápida durante o desenvolvimento

---

### 4. [supabase-advanced-patterns.md](./supabase-advanced-patterns.md)
**Padrões Avançados**

Padrões avançados e casos de uso complexos testados em produção.

**Conteúdo:**
- 🔄 Padrões de relacionamentos (One-to-Many, Many-to-Many)
- 🎯 Hooks avançados (paginação infinita, filtros dinâmicos, agregações)
- 🔐 RLS avançado (baseado em papel, relacionamentos, janela de tempo)
- 🔄 Transações complexas
- 📊 Queries otimizadas
- 🔔 Realtime avançado
- 📁 Storage avançado (validação, resize, upload múltiplo)
- 🎯 Validação (cliente e servidor)
- 🔄 Estratégias de cache

**Quando usar:** Para implementar funcionalidades complexas e otimizações

---

### 5. [supabase-migration-guide.md](./supabase-migration-guide.md)
**Guia de Migração**

Guia completo para migrar projetos existentes para Supabase.

**Conteúdo:**
- 🎯 Cenários de migração (sem backend, Firebase, API REST, PostgreSQL)
- 📝 Checklist pré-migração
- 🚀 Passo a passo detalhado para cada cenário
- 🔄 Estratégia de migração gradual
- 🧪 Testes pós-migração
- 🚨 Plano de rollback
- 📊 Monitoramento

**Quando usar:** Ao migrar um projeto existente para Supabase

---

### 6. [supabase-troubleshooting-faq.md](./supabase-troubleshooting-faq.md)
**Troubleshooting e FAQ**

Guia detalhado de resolução de problemas e perguntas frequentes.

**Conteúdo:**
- 🐛 Troubleshooting detalhado (autenticação, RLS, queries, performance, storage, realtime)
- ❓ FAQ completo (geral, autenticação, banco de dados, performance, segurança)
- 🆘 Recursos de suporte
- 📝 Como reportar bugs

**Quando usar:** Ao encontrar problemas ou ter dúvidas específicas

---

## 🚀 Como Usar Esta Documentação

### Para Novo Projeto

1. **Leia primeiro:** `supabase-connection-setup.md`
2. **Siga o checklist** no final do documento
3. **Consulte exemplos:** `supabase-usage-examples.md`
4. **Mantenha aberto:** `supabase-quick-reference.md`

### Para Projeto Existente

1. **Revise configuração atual** com `supabase-connection-setup.md`
2. **Implemente melhorias** baseadas nas boas práticas
3. **Adicione hooks customizados** usando `supabase-usage-examples.md`

### Durante Desenvolvimento

1. **Consulte:** `supabase-quick-reference.md` para comandos rápidos
2. **Copie exemplos:** de `supabase-usage-examples.md`
3. **Resolva problemas:** seção Troubleshooting em qualquer documento

## 🎓 Conceitos-Chave

### 1. Cliente Supabase Otimizado
```typescript
export const supabase = createClient(URL, KEY, {
  auth: {
    storage: localStorage,      // Persistência
    persistSession: true,       // Manter sessão
    autoRefreshToken: true,     // Renovação automática
  }
});
```

### 2. Gerenciamento de Sessão Eficiente
```typescript
// Cache inteligente para evitar múltiplas chamadas
export async function getSessionOnce(): Promise<Session | null> {
  if (currentSession) return currentSession;
  if (sessionPromise) return sessionPromise;
  // ...
}
```

### 3. Hooks React com React Query
```typescript
// Padrão recomendado para operações de banco
const { data, isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: async () => {
    const session = await getSessionOnce();
    if (!session) throw new Error("Não autenticado");
    // ...
  },
});
```

### 4. Row Level Security (RLS)
```sql
-- Sempre habilitar RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Criar políticas específicas
CREATE POLICY "policy_name" ON table_name
  FOR SELECT TO authenticated
  USING (true);
```

## 📊 Estrutura de Arquivos Recomendada

```
projeto/
├── .env                                    # Credenciais
├── .gitignore                             # Incluir .env
├── supabase/
│   ├── config.toml                        # Config CLI
│   └── migrations/                        # Migrações SQL
│       ├── 001_initial_schema.sql
│       └── ...
├── src/
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                  # Cliente configurado
│   │       └── types.ts                   # Tipos do banco
│   ├── lib/
│   │   └── auth.ts                        # Gerenciamento de sessão
│   ├── hooks/
│   │   ├── useAuth.tsx                    # Hook de autenticação
│   │   ├── useProdutos.ts                 # Hook de produtos
│   │   └── ...                            # Outros hooks
│   └── main.tsx                           # React Query Provider
└── vite.config.ts                         # Path aliases
```

## ✅ Checklist Rápido

### Configuração Inicial
- [ ] Projeto criado no Supabase
- [ ] Dependências instaladas
- [ ] `.env` configurado
- [ ] Cliente Supabase criado
- [ ] Tipos TypeScript gerados

### Autenticação
- [ ] Hook `useAuth` implementado
- [ ] Sistema de sessão configurado
- [ ] Auto-refresh de tokens ativo
- [ ] Persistência de sessão funcionando

### Banco de Dados
- [ ] Migrações criadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS configuradas
- [ ] Índices criados

### Desenvolvimento
- [ ] Hooks customizados criados
- [ ] React Query configurado
- [ ] Tratamento de erros implementado
- [ ] Testes de conexão realizados

## 🔧 Comandos Essenciais

```bash
# Setup inicial
npm install @supabase/supabase-js @tanstack/react-query
npm install -g supabase
supabase login

# Desenvolvimento
supabase start                    # Iniciar local
supabase status                   # Ver status
supabase db reset                 # Resetar banco local

# Produção
supabase db push                  # Aplicar migrações
npx supabase gen types typescript --project-id ID > src/integrations/supabase/types.ts

# Manutenção
supabase db pull                  # Baixar schema
supabase migration new name       # Nova migração
```

## 🐛 Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Invalid API key | Chave incorreta | Verificar `.env` e usar chave `anon` |
| RLS policy violation | Sem permissão | Revisar políticas RLS |
| Table doesn't exist | Migrações não aplicadas | Executar `supabase db push` |
| Session expired | Token expirado | Configurar `autoRefreshToken: true` |
| CORS error | URL não permitida | Configurar URLs no Dashboard |

## 📚 Recursos Adicionais

### Documentação Oficial
- [Supabase Docs](https://supabase.com/docs)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [CLI Reference](https://supabase.com/docs/guides/cli)

### Ferramentas
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 🎯 Próximos Passos

Após dominar estas skills:

1. **Explorar Realtime** - Implementar subscriptions em tempo real
2. **Storage Avançado** - Upload de múltiplos arquivos, resize de imagens
3. **Edge Functions** - Criar funções serverless
4. **Políticas RLS Avançadas** - Controle de acesso granular
5. **Performance** - Otimizar queries e índices
6. **Testes** - Implementar testes automatizados

## 🤝 Contribuindo

Esta documentação é baseada em implementação real e testada. Se encontrar melhorias ou novos padrões:

1. Documente o padrão
2. Teste em ambiente real
3. Adicione exemplos práticos
4. Atualize a versão

## 📝 Notas de Versão

### v1.0.0 (2026-04-30)
- ✅ Documentação inicial completa
- ✅ Baseada no projeto AgroFruta Insights
- ✅ Testada em produção
- ✅ Inclui troubleshooting completo
- ✅ Exemplos práticos validados

---

**Mantido por:** Equipe de Desenvolvimento  
**Última Atualização:** 2026-04-30  
**Status:** ✅ Produção  
**Testado em:** React 18.3.1, Vite 5.4.19, Supabase JS 2.103.0
