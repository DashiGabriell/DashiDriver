-- RLS cross-tenant smoke checks (run in SQL editor with test users)
-- Epic 9 — does not modify data; expects two companies seeded manually.

-- 1) Confirm helpers exist
SELECT
  public.is_dev_user() AS am_i_dev,
  public.current_profile_company_id() AS my_company;

-- 2) As user A (set JWT / use Dashboard "run as user"): vehicles of other companies must be empty
-- Replace :other_company_id with a UUID from another tenant
-- SELECT count(*) AS leaked
-- FROM public.carcontrol_vehicles
-- WHERE company_id = :other_company_id;
-- Expect: 0

-- 3) rate_limits must not be readable by authenticated clients
-- SELECT count(*) FROM public.rate_limits;
-- Expect: 0 rows or policy denial

-- 4) List residual USING(true) policies on tenant tables (should be empty after consolidation)
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
  AND tablename IN (
    'carcontrol_profiles','carcontrol_companies','carcontrol_vehicles',
    'carcontrol_drivers','payments','coupons','notifications','checklists',
    'impersonate_tokens','access_logs','rate_limits'
  );
