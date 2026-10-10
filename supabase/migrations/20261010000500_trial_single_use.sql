-- Teste grátis de 7 dias: uso único por conta, garantido no banco.
-- Antes, activate_trial_onboarding era executável por PUBLIC, aceitava qualquer p_user_id
-- e reativava o trial sem olhar has_used_free_trial; e a policy profiles_update_own
-- deixava o próprio usuário zerar has_used_free_trial/trial pelo cliente.

CREATE OR REPLACE FUNCTION public.activate_trial_onboarding(p_user_id uuid, p_trial_intent boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_company_id uuid;
  v_used boolean;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Não autorizado' USING ERRCODE = '42501';
  END IF;

  SELECT has_used_free_trial, company_id
    INTO v_used, v_company_id
    FROM public.carcontrol_profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF NOT p_trial_intent THEN
    UPDATE public.carcontrol_profiles SET trial_intent = FALSE WHERE id = p_user_id;
    RETURN;
  END IF;

  IF COALESCE(v_used, FALSE) THEN
    RAISE EXCEPTION 'O teste grátis de 7 dias já foi utilizado nesta conta.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.carcontrol_profiles
     SET trial = 'ativo',
         plan = 'free7dias',
         trial_intent = FALSE,
         has_used_free_trial = TRUE
   WHERE id = p_user_id;

  IF v_company_id IS NOT NULL THEN
    UPDATE public.carcontrol_companies
       SET trial = 'ativo',
           ativo = TRUE,
           saas_plan = 'BASICO'
     WHERE id = v_company_id;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.activate_trial_onboarding(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_trial_onboarding(uuid, boolean) TO authenticated;

-- Updates feitos pelo próprio usuário (PostgREST como authenticated) não alteram o estado do trial;
-- funções SECURITY DEFINER e Edge Functions (service_role) continuam podendo.
CREATE OR REPLACE FUNCTION public.protect_profile_trial_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    NEW.has_used_free_trial := OLD.has_used_free_trial;
    NEW.trial := OLD.trial;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS protect_profile_trial_columns ON public.carcontrol_profiles;
CREATE TRIGGER protect_profile_trial_columns
  BEFORE UPDATE ON public.carcontrol_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_trial_columns();
