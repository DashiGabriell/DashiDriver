-- Migration: Create security_scan_log table
-- Description: Logs every scan run (scheduled or manual) with results
-- Run this in Supabase SQL Editor before using the scan history feature

CREATE TABLE IF NOT EXISTS public.security_scan_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    triggered_by TEXT NOT NULL DEFAULT 'scheduled',
    status TEXT NOT NULL DEFAULT 'running',
    threats_detected INTEGER DEFAULT 0,
    blocks_inserted INTEGER DEFAULT 0,
    audit_logs_analyzed INTEGER DEFAULT 0,
    summary JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_scan_log_started
    ON public.security_scan_log(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_scan_log_status
    ON public.security_scan_log(status);

ALTER TABLE public.security_scan_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_log_dev_role_select" ON public.security_scan_log
    FOR SELECT TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM public.carcontrol_profiles WHERE role = 'dev'
    ));

COMMENT ON TABLE public.security_scan_log IS 'Registro de cada execucao do security monitor';
COMMENT ON COLUMN public.security_scan_log.triggered_by IS 'scheduled | manual';
COMMENT ON COLUMN public.security_scan_log.status IS 'running | completed | failed';
COMMENT ON COLUMN public.security_scan_log.summary IS 'Detalhes da varredura em JSON';
