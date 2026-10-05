import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/integrations/supabase/auth';

type TableName = keyof Database['public']['Tables'];

interface RealtimeOptions {
  select?: string;
  order?: { column: string; ascending?: boolean };
  filter?: (query: any) => any;
}

// Contador global para garantir nomes de canal únicos por instância do hook
function createChannelId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useRealtimeData<T extends TableName, R = Database['public']['Tables'][T]['Row']>(
  table: T,
  options?: RealtimeOptions
) {
  const [data, setData] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Stable ref for options to avoid infinite loop from object recreation
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Ref to track if we're currently fetching to avoid race conditions
  const fetchingRef = useRef(false);

  // ID único por instância do hook â€” evita conflito de canal quando a mesma
  // tabela é subscrita por múltiplos componentes simultaneamente
  const channelIdRef = useRef<string | null>(null);
  if (!channelIdRef.current) {
    channelIdRef.current = createChannelId();
  }

  useEffect(() => {
    // Always set loading=false when there's no session (not logged in)
    if (!session) {
      setLoading(false);
      setData([]);
      return;
    }

    let cancelled = false;

    const fetchData = async (source: 'initial' | 'realtime' = 'initial') => {
      // Prevent concurrent fetches
      if (fetchingRef.current && source === 'realtime') {

        return;
      }

      fetchingRef.current = true;

      try {
        setError(null);
        const opts = optionsRef.current;

        let query = (supabase.from as any)(table).select(opts?.select || '*');

        if (opts?.filter) {
          query = opts.filter(query);
        }

        if (opts?.order) {
          query = (query as any).order(opts.order.column, {
            ascending: opts.order.ascending ?? false,
          });
        } else {
          // created_at may not exist in all tables â€” use a safe fallback
          query = (query as any).order('created_at', { ascending: false });
        }

        const { data: result, error: fetchError } = await query;

        if (cancelled) return;

        if (fetchError) {
          // If created_at column doesn't exist, retry without ordering
          if (fetchError.code === '42703') {
            const fallback = await (supabase.from as any)(table).select(opts?.select || '*');
            if (!cancelled) {
              setData((fallback.data as R[]) || []);
              setLoading(false);
            }
            return;
          }

          setError(fetchError.message);
        } else {
          if (source === 'realtime') {

          }
          setData((result as R[]) || []);
        }
      } catch (err: any) {
        if (!cancelled) {

          setError(err?.message || 'Erro desconhecido');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    };

    fetchData('initial');

    // Nome de canal único por instância â€” evita o erro "cannot add postgres_changes
    // callbacks after subscribe()" quando múltiplos hooks observam a mesma tabela
    const channelName = `public:${String(table)}:${session.user.id}:${channelIdRef.current}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: String(table) 
        },
        (payload) => {

          // Re-fetch imediatamente após qualquer mudança (INSERT, UPDATE, DELETE)
          if (!cancelled) {
            fetchData('realtime');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {

        }
        if (status === 'CHANNEL_ERROR') {

        }
        if (status === 'CLOSED') {

        }
      });

    return () => {
      cancelled = true;
      fetchingRef.current = false;

      supabase.removeChannel(channel);
    };
    // Only re-run when table or session changes â€” options handled via ref
  }, [table, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
