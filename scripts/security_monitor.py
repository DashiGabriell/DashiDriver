#!/usr/bin/env python3
"""
DashiDrive Security Monitor
============================
Daemon que detecta e bloqueia ameaças de segurança
sem impactar a performance da aplicacao.

Uso:
    python scripts/security_monitor.py

Variaveis de ambiente necessarias:
    SUPABASE_URL              URL do projeto Supabase
    SUPABASE_SECRET_KEY       Secret key (ex-service_role)
    DISCORD_WEBHOOK_URL       Webhook do Discord para alertas

Variaveis opcionais:
    DATABASE_URL              String de conexao PostgreSQL (para pg_stats)
    BRUTE_FORCE_THRESHOLD     Minimo de falhas para considerar brute force (padrao: 10)
    SIGNUP_FLOOD_THRESHOLD    Minimo de signups/IP para considerar flood (padrao: 50)
    MONITOR_INTERVAL_MINUTES  Intervalo entre varreduras (padrao: 60)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_monitor.main import run

if __name__ == "__main__":
    run()
