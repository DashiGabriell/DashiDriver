-- Epic 9: RLS consolidation — helpers + drop permissive DEV policies + baseline tenant isolation
-- Safe to re-run. Does not weaken existing stricter policies.

-- =============================================================================
-- 1) Helper functions (SECURITY DEFINER, fixed search_path)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_dev_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.carcontrol_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'dev'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_profile_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.company_id
  FROM public.carcontrol_profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_same_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_company_id IS NOT NULL
    AND p_company_id = public.current_profile_company_id();
$$;

GRANT EXECUTE ON FUNCTION public.is_dev_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_profile_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_same_company(uuid) TO authenticated;

COMMENT ON FUNCTION public.is_dev_user IS 'True when JWT user has role=dev in carcontrol_profiles';
COMMENT ON FUNCTION public.current_profile_company_id IS 'company_id of the authenticated profile';
COMMENT ON FUNCTION public.is_same_company IS 'Tenant check: row company_id matches caller company';

-- =============================================================================
-- 2) Drop dangerous / overly-permissive policies by name pattern
-- =============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname ILIKE '%dev_select_all%'
        OR policyname ILIKE '%dev_all%'
        OR policyname ILIKE '%select_all_authenticated%'
        OR policyname ILIKE '%allow_all%'
        OR policyname ILIKE '%bypass%'
        OR (
          -- Broad "true" policies on tenant tables (not marketplace public read)
          (qual = 'true' OR with_check = 'true')
          AND tablename = ANY (ARRAY[
            'carcontrol_profiles',
            'carcontrol_companies',
            'carcontrol_vehicles',
            'carcontrol_drivers',
            'carcontrol_payments',
            'payments',
            'coupons',
            'notifications',
            'support_tickets',
            'checklists',
            'checklist_images',
            'impersonate_tokens',
            'access_logs',
            'rate_limits',
            'security_scan_log',
            'security_denylist'
          ])
        )
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END $$;

-- =============================================================================
-- 3) Ensure RLS enabled on critical tables (no-op if missing table)
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'carcontrol_profiles',
    'carcontrol_companies',
    'carcontrol_vehicles',
    'carcontrol_drivers',
    'carcontrol_payments',
    'payments',
    'coupons',
    'notifications',
    'support_tickets',
    'checklists',
    'checklist_images',
    'marketplace_listings',
    'impersonate_tokens',
    'access_logs',
    'rate_limits'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- 4) Baseline policies (create only if table exists and policy missing)
-- =============================================================================

-- carcontrol_profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='carcontrol_profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_profiles' AND policyname='profiles_select_own_or_dev') THEN
      CREATE POLICY profiles_select_own_or_dev ON public.carcontrol_profiles
        FOR SELECT TO authenticated
        USING (id = auth.uid() OR public.is_dev_user());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_profiles' AND policyname='profiles_update_own') THEN
      CREATE POLICY profiles_update_own ON public.carcontrol_profiles
        FOR UPDATE TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_profiles' AND policyname='profiles_insert_own') THEN
      CREATE POLICY profiles_insert_own ON public.carcontrol_profiles
        FOR INSERT TO authenticated
        WITH CHECK (id = auth.uid());
    END IF;
  END IF;
END $$;

-- carcontrol_companies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='carcontrol_companies') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_companies' AND policyname='companies_select_member_or_dev') THEN
      CREATE POLICY companies_select_member_or_dev ON public.carcontrol_companies
        FOR SELECT TO authenticated
        USING (id = public.current_profile_company_id() OR public.is_dev_user());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_companies' AND policyname='companies_update_member') THEN
      CREATE POLICY companies_update_member ON public.carcontrol_companies
        FOR UPDATE TO authenticated
        USING (id = public.current_profile_company_id())
        WITH CHECK (id = public.current_profile_company_id());
    END IF;
  END IF;
END $$;

-- carcontrol_vehicles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='carcontrol_vehicles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_vehicles' AND policyname='vehicles_tenant_all') THEN
      CREATE POLICY vehicles_tenant_all ON public.carcontrol_vehicles
        FOR ALL TO authenticated
        USING (public.is_same_company(company_id) OR public.is_dev_user())
        WITH CHECK (public.is_same_company(company_id) OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- carcontrol_drivers (if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='carcontrol_drivers') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='carcontrol_drivers' AND policyname='drivers_tenant_all') THEN
      CREATE POLICY drivers_tenant_all ON public.carcontrol_drivers
        FOR ALL TO authenticated
        USING (public.is_same_company(company_id) OR public.is_dev_user())
        WITH CHECK (public.is_same_company(company_id) OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- payments (saas billing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='payments_select_own_or_dev') THEN
      CREATE POLICY payments_select_own_or_dev ON public.payments
        FOR SELECT TO authenticated
        USING (user_id = auth.uid() OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- coupons: authenticated read active only; mutate via service role / edge
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='coupons') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='coupons' AND policyname='coupons_select_active_or_dev') THEN
      CREATE POLICY coupons_select_active_or_dev ON public.coupons
        FOR SELECT TO authenticated
        USING (active = true OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='notifications_own') THEN
      CREATE POLICY notifications_own ON public.notifications
        FOR ALL TO authenticated
        USING (user_id = auth.uid() OR public.is_dev_user())
        WITH CHECK (user_id = auth.uid() OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- checklists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='checklists') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklists' AND policyname='checklists_tenant_all') THEN
      CREATE POLICY checklists_tenant_all ON public.checklists
        FOR ALL TO authenticated
        USING (public.is_same_company(company_id) OR public.is_dev_user())
        WITH CHECK (public.is_same_company(company_id) OR public.is_dev_user());
    END IF;
  END IF;
END $$;

-- rate_limits: no client access (already intended); reinforce
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rate_limits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rate_limits' AND policyname='rate_limits_no_client_access') THEN
      CREATE POLICY rate_limits_no_client_access ON public.rate_limits
        FOR ALL TO authenticated, anon
        USING (false)
        WITH CHECK (false);
    END IF;
  END IF;
END $$;

-- =============================================================================
-- 5) Snapshot helper view for audits (dev-only via RLS not needed — security_invoker)
-- =============================================================================

CREATE OR REPLACE VIEW public.rls_policy_snapshot
WITH (security_invoker = true)
AS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

COMMENT ON VIEW public.rls_policy_snapshot IS 'Audit snapshot of public RLS policies (Epic 9)';

REVOKE ALL ON public.rls_policy_snapshot FROM PUBLIC;
REVOKE ALL ON public.rls_policy_snapshot FROM anon, authenticated;
GRANT SELECT ON public.rls_policy_snapshot TO service_role;
