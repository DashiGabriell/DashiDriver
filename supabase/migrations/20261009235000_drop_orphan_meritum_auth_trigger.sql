-- O trigger do produto meritum em auth.users insere em public.meritum_users, que não
-- existe mais neste banco; a falha abortava todo cadastro (signup devolvia 500).
DROP TRIGGER IF EXISTS meritum_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.meritum_sync_auth_user();
