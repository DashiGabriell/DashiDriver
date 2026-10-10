-- Cadastro de empresa no onboarding.
-- carcontrol_companies não tem policy de INSERT, então o insert direto pelo cliente
-- retornava 403. A criação passa a ser feita por esta função, que decide ativo/trial/
-- saas_plan a partir do perfil no servidor e vincula o usuário como admin.

CREATE OR REPLACE FUNCTION public.create_company_onboarding(
  p_nome text,
  p_cnpj text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_endereco text DEFAULT NULL
)
RETURNS public.carcontrol_companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_profile record;
  v_company public.carcontrol_companies;
  v_is_trial boolean;
  v_saas_plan public.carcontrol_companies.saas_plan%TYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autorizado' USING ERRCODE = '42501';
  END IF;

  IF NULLIF(btrim(p_nome), '') IS NULL THEN
    RAISE EXCEPTION 'Nome da empresa é obrigatório' USING ERRCODE = '22023';
  END IF;

  SELECT plan, trial, company_id, role
    INTO v_profile
    FROM public.carcontrol_profiles
   WHERE id = v_uid
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF v_profile.company_id IS NOT NULL THEN
    SELECT * INTO v_company FROM public.carcontrol_companies WHERE id = v_profile.company_id;
    IF FOUND THEN
      RETURN v_company;
    END IF;
  END IF;

  v_is_trial := v_profile.plan IN ('free7dias', 'trial') AND v_profile.trial = 'ativo';

  v_saas_plan := CASE v_profile.plan
    WHEN 'gestao-pro' THEN 'PRO'
    WHEN 'gestao-master' THEN 'MASTER'
    ELSE 'BASICO'
  END;

  INSERT INTO public.carcontrol_companies (nome, cnpj, email, telefone, endereco, ativo, trial, saas_plan)
  VALUES (
    btrim(p_nome),
    NULLIF(btrim(p_cnpj), ''),
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_telefone), ''),
    NULLIF(btrim(p_endereco), ''),
    v_is_trial,
    CASE WHEN v_is_trial THEN 'ativo' END,
    v_saas_plan
  )
  RETURNING * INTO v_company;

  UPDATE public.carcontrol_profiles
     SET company_id = v_company.id,
         role = CASE WHEN role = 'dev' THEN 'dev' ELSE 'admin' END
   WHERE id = v_uid;

  RETURN v_company;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_company_onboarding(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_company_onboarding(text, text, text, text, text) TO authenticated;
