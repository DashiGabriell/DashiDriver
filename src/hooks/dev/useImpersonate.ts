import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const IMPERSONATE_KEY = 'impersonate_active';

export function useImpersonate() {
  const [loading, setLoading] = useState(false);

  const impersonate = useCallback(async (targetUserId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/impersonate-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Erro ao personificar');

      sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify({
        nome: data.nome,
        email: data.email,
      }));

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.token,
      });

      if (signInError) {
        sessionStorage.removeItem(IMPERSONATE_KEY);
        throw new Error('Falha ao autenticar como usuário: ' + signInError.message);
      }

      toast.success(`Personificando ${data.nome || data.email}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopImpersonating = useCallback(async () => {
    sessionStorage.removeItem(IMPERSONATE_KEY);
    await supabase.auth.signOut();
  }, []);

  const getImpersonateInfo = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(IMPERSONATE_KEY);
      return raw ? JSON.parse(raw) as { nome: string; email: string } : null;
    } catch {
      return null;
    }
  }, []);

  const isImpersonating = getImpersonateInfo() !== null;

  return { impersonate, stopImpersonating, getImpersonateInfo, isImpersonating, loading };
}
