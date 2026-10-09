// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Database, Json } from '@/integrations/supabase/types';
import {
  SAAS_PLAN_LABELS,
  SAAS_PLAN_LIMITS,
  saasLabelFor,
  saasLimitsFor,
  type SaasPlanId,
} from '@/lib/billing/plans';

export type CarcontrolUser = Database['public']['Tables']['carcontrol_user']['Row'];
export type CarcontrolUserUpdate = Database['public']['Tables']['carcontrol_user']['Update'];
export type CarcontrolCompany = Database['public']['Tables']['carcontrol_companies']['Row'];

export type UserRole = 'user' | 'admin' | 'dev';
export type SaasPlan = NonNullable<CarcontrolCompany['saas_plan']> | SaasPlanId;

export { SAAS_PLAN_LABELS, SAAS_PLAN_LIMITS };

interface UseCarcontrolUserReturn {
  profile: CarcontrolUser | null;
  company: CarcontrolCompany | null;
  userRole: UserRole;
  planName: string;
  planLimits: { veiculos: number; motoristas: number };
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<CarcontrolUserUpdate>) => Promise<{ error: string | null }>;
  updatePreferencias: (prefs: Record<string, unknown>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const lastAccessTouched = new Set<string>();

export function useCarcontrolUser(): UseCarcontrolUserReturn {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CarcontrolUser | null>(null);
  const [company, setCompany] = useState<CarcontrolCompany | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('carcontrol_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        // Perfil ainda não existe — será criado pelo trigger na próxima autenticação
        if (fetchError.code === 'PGRST116') {
          setProfile(null);
        } else {
          setError(fetchError.message);

        }
        return;
      }

      if (!data) {
        setProfile(null);
        setCompany(null);
        setUserRole('user');
        return;
      }

      const companyId = data.company_id;
      setUserRole((data.role as UserRole | null) || 'user');
      let fetchedCompany: CarcontrolCompany | null = null;

      if (companyId) {
        const { data: companyData, error: companyError } = await supabase
          .from('carcontrol_companies')
          .select('*')
          .eq('id', companyId)
          .single();
        
        if (companyError) {

        } else {
          fetchedCompany = companyData;
          setCompany(companyData);
        }
      } else {

      }

      let total_veiculos = data.total_veiculos;
      let total_motoristas = data.total_motoristas;
      const resourceCompanyId = fetchedCompany?.id || companyId;

      try {
        const [{ count: vehicleCount, error: vehicleError }, { count: driverCount, error: driverError }] =
          await Promise.all([
            supabase
              .from('carcontrol_vehicles')
              .select('id', { count: 'exact', head: true })
              .eq(resourceCompanyId ? 'company_id' : 'user_id', resourceCompanyId || session.user.id),
            supabase
              .from('carcontrol_drivers')
              .select('id', { count: 'exact', head: true })
              .eq(resourceCompanyId ? 'company_id' : 'user_id', resourceCompanyId || session.user.id),
          ]);

        if (vehicleError) {

        } else if (typeof vehicleCount === 'number') {
          total_veiculos = vehicleCount;
        }

        if (driverError) {

        } else if (typeof driverCount === 'number') {
          total_motoristas = driverCount;
        }
      } catch (countErr: any) {

      }

      const profileWithCounts = {
        ...data,
        company_id: companyId,
        total_veiculos,
        total_motoristas,
      };

      setProfile(profileWithCounts);

    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Registra último acesso uma vez por sessão (o hook é montado em vários componentes).
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || !profile?.id || lastAccessTouched.has(userId)) return;
    lastAccessTouched.add(userId);

    supabase
      .from('carcontrol_profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .then(() => undefined, () => undefined);
  }, [session?.user?.id, profile?.id]);

  const updateProfile = useCallback(async (updates: Partial<CarcontrolProfileUpdate>) => {
    if (!session?.user?.id) return { error: 'Usuário não autenticado' };

    try {
      const { error: updateError } = await supabase
        .from('carcontrol_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', session.user.id)
        .throwOnError();

      if (updateError) {

        return { error: updateError.message };
      }

      await fetchProfile();
      return { error: null };
    } catch (err: any) {

      return { error: err?.message || 'Erro ao atualizar perfil' };
    }
  }, [session?.user?.id, fetchProfile]);

  const updatePreferencias = useCallback(async (prefs: Record<string, unknown>) => {
    if (!session?.user?.id) return { error: 'Usuário não autenticado' };

    const existingPrefs = (profile?.preferencias as Record<string, unknown>) || {};
    const mergedPrefs = { ...existingPrefs, ...prefs };

    try {
      const { error: updateError } = await supabase
        .from('carcontrol_profiles')
        .update({ preferencias: mergedPrefs, updated_at: new Date().toISOString() })
        .eq('id', session.user.id)
        .throwOnError();

      if (updateError) {

        return { error: updateError.message };
      }

      await fetchProfile();
      return { error: null };
    } catch (err: any) {

      return { error: err?.message || 'Erro ao atualizar preferências' };
    }
  }, [session?.user?.id, profile?.preferencias, fetchProfile]);

  return {
    profile,
    company,
    userRole,
    planName: saasLabelFor(company?.saas_plan),
    planLimits: saasLimitsFor(company?.saas_plan),
    loading,
    error,
    updateProfile,
    updatePreferencias,
    refreshProfile: fetchProfile,
  };
}
