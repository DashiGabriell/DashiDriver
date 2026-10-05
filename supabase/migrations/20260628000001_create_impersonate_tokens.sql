-- Migration: Create impersonate_tokens table
-- Description: Stores single-use tokens for dev impersonation of users
-- Idempotent: safe to re-run (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.impersonate_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    token UUID NOT NULL DEFAULT gen_random_uuid(),
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impersonate_tokens_token ON public.impersonate_tokens(token);

ALTER TABLE public.impersonate_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "impersonate_tokens_dev_select" ON public.impersonate_tokens;
CREATE POLICY "impersonate_tokens_dev_select" ON public.impersonate_tokens
    FOR SELECT TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM public.carcontrol_profiles WHERE role = 'dev'
    ));

COMMENT ON TABLE public.impersonate_tokens IS 'Tokens de uso unico para personificacao de usuarios por devs';
COMMENT ON COLUMN public.impersonate_tokens.email IS 'Email do usuario alvo';
COMMENT ON COLUMN public.impersonate_tokens.token IS 'Token unico usado como senha temporaria';
COMMENT ON COLUMN public.impersonate_tokens.used IS 'Se o token ja foi usado';
COMMENT ON COLUMN public.impersonate_tokens.expires_at IS 'Data de expiracao (2 minutos apos criacao)';
COMMENT ON COLUMN public.impersonate_tokens.created_by IS 'ID do dev que solicitou a personificacao';
