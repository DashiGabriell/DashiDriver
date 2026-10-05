import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { useProfile } from "@/hooks/useProfile";

interface DevProtectedRouteProps {
  children: ReactNode;
}

export const DevProtectedRoute = ({ children }: DevProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Primeira barreira: verificação client-side de role
  // Segunda barreira (server-side): as Edge Functions admin (criadas na FASE 1)
  // validam a role do usuário antes de retornar dados sensíveis
  if (profile?.role !== 'dev') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
