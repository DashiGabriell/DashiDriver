-- Ensure rate_limits table + check_rate_limit RPC (window-aware)
-- Applied remotely 23/07/2026 — kept in repo as source of truth

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 1,
  UNIQUE (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window
  ON public.rate_limits (key, window_start DESC);

-- Must DROP first: return type changed (added retry_after).
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_requests INT,
  p_window_seconds INT DEFAULT 60
)
RETURNS TABLE (allowed BOOLEAN, remaining INT, retry_after INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_seconds INT := GREATEST(COALESCE(p_window_seconds, 60), 1);
  v_window_start TIMESTAMPTZ;
  v_count INT;
  v_elapsed INT;
BEGIN
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / v_window_seconds) * v_window_seconds
  );

  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING public.rate_limits.count INTO v_count;

  IF v_count IS NULL THEN
    v_count := 1;
  END IF;

  allowed := v_count <= p_max_requests;
  remaining := GREATEST(p_max_requests - v_count, 0);

  v_elapsed := GREATEST(
    (extract(epoch FROM now()) - extract(epoch FROM v_window_start))::INT,
    0
  );
  retry_after := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(v_window_seconds - v_elapsed, 1)
  END;

  RETURN NEXT;
END;
$$;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rate_limits_no_client_access" ON public.rate_limits;
CREATE POLICY "rate_limits_no_client_access"
  ON public.rate_limits
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO authenticated;

COMMENT ON TABLE public.rate_limits IS 'Rate limit counters for Edge Functions';
COMMENT ON FUNCTION public.check_rate_limit IS 'Increment and check rate limit; returns allowed, remaining, retry_after';
