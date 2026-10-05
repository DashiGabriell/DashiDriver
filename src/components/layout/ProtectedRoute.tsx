import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { useHasCompany } from "@/hooks/useCompany";
import { useProfile } from "@/hooks/useProfile";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ImpersonateBanner } from "@/components/dev/ImpersonateBanner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCompany?: boolean;
}

export const ProtectedRoute = ({ children, requireCompany = true }: ProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { hasCompany, isLoading: companyLoading } = useHasCompany();
  const { isLoading: profileLoading } = useProfile();
  const { data: access, isLoading: accessLoading } = useAccessControl();
  const location = useLocation();

  const loadingAnimation = (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <img
        src="/assets/loading-carcontrol-coelho.gif"
        alt="Carregando"
        className="w-48 max-w-full"
      />
    </div>
  );

  if (authLoading) return loadingAnimation;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (companyLoading || profileLoading || accessLoading) return loadingAnimation;

  const isExcludedPath =
    location.pathname === "/bem-vindo" ||
    location.pathname === "/onboarding" ||
    location.pathname.startsWith("/mobile/onboarding-cadastro") ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/marketplace") ||
    location.pathname === "/mobile/trial-expirado" ||
    location.pathname === "/mobile/pagamento-pendente" ||
    location.pathname.startsWith("/ajuda");

  if (requireCompany && !hasCompany && !isExcludedPath) {
    return <Navigate to="/mobile/onboarding-cadastro" replace />;
  }

  // Se tem empresa e está no onboarding, redireciona para dashboard (sem exigir access check)
  if (hasCompany && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isExcludedPath && access && !access.authorized) {
    if (access.authorizationReason === "payment_pending") {
      return <Navigate to="/mobile/pagamento-pendente" replace />;
    }
    return <Navigate to="/mobile/trial-expirado" replace />;
  }

  return (
    <>
      <ImpersonateBanner />
      {children}
    </>
  );
};
