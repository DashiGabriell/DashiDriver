-- Migration: Add dev role SELECT policy for security_denylist
-- Description: Allows users with dev role to view the denylist in the admin panel
-- Run this in Supabase SQL Editor

CREATE POLICY "dev_role_select" ON public.security_denylist
    FOR SELECT TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM public.carcontrol_profiles WHERE role = 'dev'
    ));
