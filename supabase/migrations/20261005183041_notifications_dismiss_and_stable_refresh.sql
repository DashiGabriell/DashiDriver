-- Notificações: exclusão lógica (dismissed_at) e refresh idempotente.
--
-- refresh_user_notifications() recalcula alertas derivados (pagamento atrasado,
-- seguro vencendo, manutenção vencida, plano expirando) via upsert por dedupe_key.
-- Antes: todo refresh reescrevia as linhas (read=false, updated_at=now()), o que
-- (1) gerava eventos realtime em loop no cliente, (2) desfazia "marcar como lida"
-- e (3) recriava notificações apagadas. Agora a exclusão é lógica e o upsert só
-- toca linhas não dispensadas cujo conteúdo realmente mudou.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS dismissed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_notifications_user_active
  ON public.notifications (user_id, created_at DESC)
  WHERE dismissed_at IS NULL;

CREATE OR REPLACE FUNCTION public.create_carcontrol_notification(
  p_company_id uuid,
  p_user_id uuid,
  p_type text,
  p_category text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL::text,
  p_related_entity_type text DEFAULT NULL::text,
  p_related_entity_id uuid DEFAULT NULL::uuid,
  p_dedupe_key text DEFAULT NULL::text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_notification_id UUID;
BEGIN
  IF p_company_id IS NULL OR p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (
    company_id, user_id, type, category, title, message, action_url,
    related_entity_type, related_entity_id, dedupe_key, metadata
  )
  VALUES (
    p_company_id, p_user_id, p_type, p_category, p_title, p_message, p_action_url,
    p_related_entity_type, p_related_entity_id, p_dedupe_key,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (user_id, dedupe_key) WHERE dedupe_key IS NOT NULL
  DO UPDATE SET
    type = EXCLUDED.type,
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    action_url = EXCLUDED.action_url,
    metadata = EXCLUDED.metadata
  WHERE public.notifications.dismissed_at IS NULL
    AND (
      public.notifications.type,
      public.notifications.title,
      public.notifications.message,
      public.notifications.action_url,
      public.notifications.metadata
    ) IS DISTINCT FROM (
      EXCLUDED.type,
      EXCLUDED.title,
      EXCLUDED.message,
      EXCLUDED.action_url,
      EXCLUDED.metadata
    )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$function$;
