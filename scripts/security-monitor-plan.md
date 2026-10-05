# Plano: Security Monitor — DashiDrive

**Data:** 20 de Junho de 2026
**Status:** Planejado

---

## 1. Objetivo

Criar um daemon Python (`security_monitor.py`) que **detecta e bloqueia** ataques, injections e abusos na plataforma DashiDrive **sem impactar a performance da aplicação**.

## 2. Arquitetura

```

[Cron a cada 1h] → security_monitor.py
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
     Supabase Auth   pg_stat_   Edge Function
     Audit Logs     activity      Logs
                        │
                    ┌───┴───┐
                    ▼       ▼
              Analisador  Bloqueio
              (detecta)   (age)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Discord Webhook     Supabase Admin API
              (alerta)            (desativa user/bloqueia IP)
```

**Princípio fundamental:** o monitor roda **fora do caminho crítico** da aplicação. Em momento algum ele intercepta requisições do usuário ou adiciona latência ao SPA, Edge Functions ou banco de dados.

## 3. Stack

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem | Python 3.11+ |
| HTTP Client | `httpx` (async) |
| Supabase API | REST (Admin API + Management API) |
| PostgreSQL | `psycopg2` ou `asyncpg` (read-only) |
| Alerta | Discord Webhook (embeds) |
| Agendador | Windows Task Scheduler / cron |

## 4. Estrutura de Arquivos

```
scripts/
├── security_monitor.py          # Orquestrador principal
├── security-monitor-plan.md     # Este documento
└── security_monitor/
    ├── __init__.py
    ├── config.py                # Env vars + constantes
    ├── supabase_client.py       # Conexão read-only com Supabase
    ├── collectors/
    │   ├── __init__.py
    │   ├── auth_logs.py         # GET /auth/v1/admin/audit
    │   └── pg_stats.py          # pg_stat_activity + queries lentas
    ├── analyzers/
    │   ├── __init__.py
    │   ├── brute_force.py       # Falhas de login/IP
    │   ├── injection.py         # Padrões de SQL injection
    │   └── anomaly.py           # Desvio de padrão de uso
    ├── blockers/
    │   ├── __init__.py
    │   ├── block_ip.py          # Insere IP na denylist
    │   └── disable_user.py      # Desativa user via Admin API
    ├── alerters/
    │   ├── __init__.py
    │   └── discord.py           # Webhook Discord
    └── utils/
        ├── __init__.py
        └── logger.py            # Logging estruturado do próprio monitor
```

## 5. Fluxo de Execução (a cada 1 hora)

```
1. Coletar logs de autenticação das últimas 1h
   → GET /auth/v1/admin/audit?limit=1000
   → Filtra: created_at > (now() - 1h)

2. Coletar estatísticas do PostgreSQL
   → SELECT * FROM pg_stat_activity
   → SELECT query, calls, total_time FROM pg_stat_statements
      ORDER BY total_time DESC LIMIT 50

3. Analisar padrões suspeitos
   → brute_force: IPs com >10 falhas de login na última hora
   → injection: queries contendo UNION, OR 1=1, DROP, pg_sleep, etc
   → anomaly: signup flood (>50/hora), device novo, geo estranho

4. Bloquear (se detectado)
   → Inserir IP em security_denylist (tabela Supabase)
   → Desativar usuário via Admin API (se necessário)

5. Alertar (sempre que algo for detectado)
   → Enviar embed formatado para Discord Webhook

6. Log interno
   → Escrever resultado da varredura em log local
```

## 6. O Que Detecta & Bloqueia

| Ameaça | Detecção | Ação |
|--------|----------|------|
| **Brute force login** | >10 falhas de login/IP em 1h | Bloqueia IP + alerta Discord |
| **SQL Injection** | Padrões suspeitos em queries lentas (UNION, OR 1=1, pg_sleep, DROP, etc) | Alerta Discord |
| **Signup flood** | >50 signups/IP em 1h | Bloqueia IP + alerta Discord |
| **Edge Function abuse** | >1000 chamadas/user em 1h | Desativa user temporariamente + alerta |
| **Token replay** | Mesmo token usado de locais diferentes em <5min | Desativa user + alerta |
| **Novo device/location** | Login de device ou cidade nunca vistos antes | Alerta Discord (não bloqueia automático) |
| **Query anômala lenta** | Query com scan sequencial em tabela grande | Alerta Discord |

## 7. Tabela Auxiliar no Supabase

```sql
CREATE TABLE IF NOT EXISTS public.security_denylist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_id UUID,
  reason TEXT NOT NULL,
  blocked_by TEXT DEFAULT 'security_monitor',
  blocked_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_security_denylist_ip ON public.security_denylist(ip_address);
CREATE INDEX idx_security_denylist_user ON public.security_denylist(user_id);
```

**Uso:** as Edge Functions verificam esta tabela no início de cada requisição (middleware simples). Se o IP ou user_id estiver na lista, a requisição é rejeitada com 403.

## 8. Performance: Zero Impacto na Aplicação

| Aspecto | Explicação |
|---------|-----------|
| ⏱️ **Fora do path da request** | O monitor roda a cada 1h via agendador, nunca entre o usuário e o servidor |
| 📖 **Read-only no banco** | Consultas usam `pg_stat_activity` e `pg_stat_statements` — views de sistema, sem locks |
| 🔄 **Sem concorrência** | Uma execução por vez, sem overhead para o banco de produção |
| 🧩 **Escrita apenas na denylist** | Bloqueios são INSERT leves em tabela auxiliar |
| 🚫 **Sem bibliotecas pesadas** | Apenas `httpx` + `asyncpg` — sem frameworks |
| ⚡ **Tempo de execução** | Estimado <10 segundos por varredura |

## 9. Canal de Alerta

**Discord Webhook** — formato rich embed:

```json
{
  "embeds": [{
    "title": "🚨 Alerta de Segurança — DashiDrive",
    "color": 16711680,
    "fields": [
      {"name": "Ameaça", "value": "Brute Force Login"},
      {"name": "IP", "value": "189.45.67.89"},
      {"name": "Tentativas", "value": "47 falhas em 1h"},
      {"name": "Ação", "value": "✅ IP bloqueado"}
    ],
    "timestamp": "2026-06-20T10:00:00Z"
  }]
}
```

## 10. Implementação (Estimativa: 4-5 horas)

| Etapa | Descrição | Tempo |
|-------|-----------|-------|
| 1 | Estrutura do projeto + `config.py` + `supabase_client.py` | 30min |
| 2 | `collectors/auth_logs.py` — paginação, rate limit, filtro temporal | 30min |
| 3 | `collectors/pg_stats.py` — pg_stat_activity + pg_stat_statements | 30min |
| 4 | `analyzers/brute_force.py` — contagem por IP, threshold | 30min |
| 5 | `analyzers/injection.py` — regex patterns + falso-positivo | 30min |
| 6 | `analyzers/anomaly.py` — signup flood, token replay | 30min |
| 7 | `blockers/block_ip.py` + `disable_user.py` | 30min |
| 8 | `alerters/discord.py` — rich embed, rate limit Discord | 30min |
| 9 | `main.py` — orquestrador, scheduler, error handling | 30min |
| 10 | SQL da tabela `security_denylist` + agendamento Windows | 30min |

## 11. Configuração (Variáveis de Ambiente)

```env
SUPABASE_URL=https://igchaidmowxpyjapjybe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_key_aqui
SUPABASE_ANON_KEY=sb_anon_key_aqui
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
MONITOR_INTERVAL_MINUTES=60
BRUTE_FORCE_THRESHOLD=10
SIGNUP_FLOOD_THRESHOLD=50
EDGE_ABUSE_THRESHOLD=1000
```

## 12. Verificação e Testes

| Teste | O que verificar |
|-------|----------------|
| Conexão Supabase | Conseguir listar audit logs com service_role |
| Coleta pg_stat | SELECT em pg_stat_activity funciona |
| Detecção brute force | Inserir 11 logins falhos no banco → dispara alerta |
| Bloqueio IP | IP inserido em security_denylist |
| Alerta Discord | Embed chega no canal configurado |
| Falso positivo | Query legítima com "union" não dispara alarme |

---

## Próximos Passos

1. Aprovar este plano
2. Criar service role key **rotacionada** (não usar a que está exposta no `.mcp.json`)
3. Rodar a migration SQL da `security_denylist`
4. Implementar o monitor em Python
5. Testar cada detecção individualmente
6. Agendar no Windows Task Scheduler
