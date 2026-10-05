import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

let currentSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;

supabase.auth.onAuthStateChange((_, session) => {
  currentSession = session;
  sessionPromise = null;
});

export async function getSessionOnce(): Promise<Session | null> {
  if (currentSession) return currentSession;
  if (sessionPromise) return sessionPromise;

  sessionPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    currentSession = session;
    sessionPromise = null;
    return session;
  });

  return sessionPromise;
}

export async function getUserOnce(): Promise<User | null> {
  const session = await getSessionOnce();
  return session?.user ?? null;
}
