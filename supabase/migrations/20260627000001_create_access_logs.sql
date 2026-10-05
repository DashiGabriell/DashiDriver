-- Migration: Create access_logs table
-- Description: Logs user accesses with IP geolocation data for the globe visualization
-- Idempotent: safe to re-run (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    city TEXT,
    region TEXT,
    country TEXT,
    country_code VARCHAR(2),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_coordinates ON public.access_logs(latitude, longitude);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_logs_admin_select" ON public.access_logs;
CREATE POLICY "access_logs_admin_select" ON public.access_logs
    FOR SELECT TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM public.carcontrol_profiles WHERE role IN ('admin', 'dev')
    ));

DROP POLICY IF EXISTS "access_logs_insert_own" ON public.access_logs;
CREATE POLICY "access_logs_insert_own" ON public.access_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.access_logs IS 'Registros de acesso dos usuarios com dados de geolocalizacao';
COMMENT ON COLUMN public.access_logs.ip_address IS 'Endereco IP do usuario no momento do acesso';
COMMENT ON COLUMN public.access_logs.latitude IS 'Latitude da geolocalizacao do IP';
COMMENT ON COLUMN public.access_logs.longitude IS 'Longitude da geolocalizacao do IP';
