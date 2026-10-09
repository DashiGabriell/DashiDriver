-- Billing hardening: payments are written only by Edge Functions (service role).

-- payments: no client-side inserts (a user could fabricate an APPROVED row for themselves)
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;

DROP POLICY IF EXISTS payments_delete_dev ON public.payments;
CREATE POLICY payments_delete_dev ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_dev_user());

REVOKE ALL ON public.payments FROM anon;
REVOKE INSERT, UPDATE, TRUNCATE, REFERENCES, TRIGGER ON public.payments FROM authenticated;
GRANT SELECT, DELETE ON public.payments TO authenticated;

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELING', 'CANCELED'));

CREATE UNIQUE INDEX IF NOT EXISTS payments_asaas_subscription_id_key
  ON public.payments (asaas_subscription_id)
  WHERE asaas_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_user_status_idx
  ON public.payments (user_id, status);

-- coupons: codes are validated by process-payment (validate_only); only devs read or manage the table
DROP POLICY IF EXISTS coupons_select_active_or_dev ON public.coupons;
DROP POLICY IF EXISTS coupons_select_dev ON public.coupons;
DROP POLICY IF EXISTS coupons_insert_dev ON public.coupons;
DROP POLICY IF EXISTS coupons_update_dev ON public.coupons;
DROP POLICY IF EXISTS coupons_delete_dev ON public.coupons;

CREATE POLICY coupons_select_dev ON public.coupons
  FOR SELECT TO authenticated
  USING (public.is_dev_user());

CREATE POLICY coupons_insert_dev ON public.coupons
  FOR INSERT TO authenticated
  WITH CHECK (public.is_dev_user());

CREATE POLICY coupons_update_dev ON public.coupons
  FOR UPDATE TO authenticated
  USING (public.is_dev_user())
  WITH CHECK (public.is_dev_user());

CREATE POLICY coupons_delete_dev ON public.coupons
  FOR DELETE TO authenticated
  USING (public.is_dev_user());

REVOKE ALL ON public.coupons FROM anon;
