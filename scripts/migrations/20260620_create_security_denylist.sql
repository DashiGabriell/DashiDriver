-- Migration: Create security_denylist table
-- Description: Stores blocked IPs and user IDs by the security monitor
-- Run this in Supabase SQL Editor before using the security_monitor

CREATE TABLE IF NOT EXISTS public.security_denylist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT,
    user_id UUID,
    reason TEXT NOT NULL,
    blocked_by TEXT DEFAULT 'security_monitor',
    blocked_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_security_denylist_ip
    ON public.security_denylist(ip_address);

CREATE INDEX IF NOT EXISTS idx_security_denylist_user
    ON public.security_denylist(user_id);

-- RLS: apenas admins e o security_monitor podem ler/escrever
ALTER TABLE public.security_denylist ENABLE ROW LEVEL SECURITY;

-- O security_monitor usa a secret key (bypass RLS), entao esta policy
-- e para usuarios autenticados via SPA (nao conseguem ver a denylist)
CREATE POLICY "denylist_service_role_only" ON public.security_denylist
    FOR ALL TO authenticated
    USING (false);

COMMENT ON TABLE public.security_denylist IS 'Lista de IPs e usuarios bloqueados pelo security_monitor';
COMMENT ON COLUMN public.security_denylist.ip_address IS 'IP bloqueado (opcional, se for bloqueio por IP)';
COMMENT ON COLUMN public.security_denylist.user_id IS 'ID do usuario bloqueado (opcional, se for bloqueio de user)';
COMMENT ON COLUMN public.security_denylist.reason IS 'Motivo do bloqueio';
COMMENT ON COLUMN public.security_denylist.blocked_by IS 'Nome do modulo que bloqueou';
COMMENT ON COLUMN public.security_denylist.expires_at IS 'Se preenchido, bloqueio temporario';
