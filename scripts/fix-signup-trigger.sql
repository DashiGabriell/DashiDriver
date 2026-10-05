-- =====================================================================
-- FIX: erro 500 "Database error saving new user" no endpoint /auth/v1/signup
-- Como aplicar: cole e rode este SQL no Supabase Dashboard -> SQL Editor
-- =====================================================================

-- 1. Remover triggers antigos/duplicados em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS carcontrol_on_auth_user_created ON auth.users;

-- 2. Recriar a função de forma defensiva. Cada insert auxiliar fica
--    em bloco BEGIN/EXCEPTION próprio: uma falha numa tabela auxiliar
--    NUNCA derruba o signup (o auth.users continua sendo criado).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Perfil principal usado pelo app (multi-tenant)
  BEGIN
    INSERT INTO public.carcontrol_profiles (id, email, full_name, role, trial)
    VALUES (NEW.id, NEW.email, v_full_name, 'admin', NULL)
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(public.carcontrol_profiles.full_name, EXCLUDED.full_name);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user carcontrol_profiles: %', SQLERRM;
  END;

  -- Tabela de usuário (limites/preferências) usada pelo hook useCarcontrolUser
  BEGIN
    INSERT INTO public.carcontrol_user (id, email, nome, ativo)
    VALUES (NEW.id, NEW.email, v_full_name, true)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user carcontrol_user: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Recriar trigger oficial único em auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grants para o supabase_auth_admin executar a função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
