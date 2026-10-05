import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LegacyMobileRedirect } from "@/components/layout/LegacyMobileRedirect";

const OnboardingCadastro = lazy(() => import("@/pages/OnboardingCadastro"));
const TrialExpirado = lazy(() => import("@/pages/TrialExpirado"));
const PagamentoPendente = lazy(() => import("@/pages/PagamentoPendente"));
const Presente = lazy(() => import("@/pages/Presente"));

export const acessoRoutes = (
  <>
    <Route path="/presente" element={<Presente />} />
    <Route path="/trial-expirado" element={<TrialExpirado />} />
    <Route path="/pagamento-pendente" element={<PagamentoPendente />} />
    <Route
      path="/onboarding-cadastro"
      element={
        <ProtectedRoute requireCompany={false}>
          <OnboardingCadastro />
        </ProtectedRoute>
      }
    />
    <Route path="/mobile/*" element={<LegacyMobileRedirect />} />
  </>
);
