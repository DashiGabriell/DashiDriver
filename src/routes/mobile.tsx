import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SuspenseBoundary } from "@/routes/SuspenseBoundary";

const MobileLayout = lazy(() => import("@/layouts/mobile/MobileLayout"));
const MobileHome = lazy(() => import("@/pages/mobile/MobileHome"));
const MobileChecklists = lazy(() => import("@/pages/mobile/Checklists"));
const MobileChecklistNew = lazy(() => import("@/pages/mobile/ChecklistNew"));
const MobileChecklistDetail = lazy(() => import("@/pages/mobile/ChecklistDetail"));
const MobileChecklistCompare = lazy(() => import("@/pages/mobile/ChecklistCompare"));
const MobileFrota = lazy(() => import("@/pages/mobile/MobileFrota"));
const MobileAlertas = lazy(() => import("@/pages/mobile/MobileAlertas"));
const MobilePerfil = lazy(() => import("@/pages/mobile/MobilePerfil"));
const MobilePagamentos = lazy(() => import("@/pages/mobile/MobilePagamentos"));
const MobileManutencao = lazy(() => import("@/pages/mobile/MobileManutencao"));
const MobileManutencaoNew = lazy(() => import("@/pages/mobile/MobileManutencaoNew"));
const MobileMotoristas = lazy(() => import("@/pages/mobile/MobileMotoristas"));
const MobileMotoristaDetalhe = lazy(() => import("@/pages/mobile/MobileMotoristaDetalhe"));
const MobileManutencaoDetalhe = lazy(() => import("@/pages/mobile/MobileManutencaoDetalhe"));
const MobileAlugueis = lazy(() => import("@/pages/mobile/MobileAlugueis"));
const MobilePresente = lazy(() => import("@/pages/mobile/Presente"));
const MobileOnboardingCadastro = lazy(() => import("@/pages/mobile/OnboardingCadastro"));
const MobileTrialExpirado = lazy(() => import("@/pages/mobile/TrialExpirado"));
const MobilePagamentoPendente = lazy(() => import("@/pages/mobile/PagamentoPendente"));
const Mobile404NotFound = lazy(() => import("@/pages/mobile/Mobile404NotFound"));

/** Standalone mobile pages rendered inside PageTransitionLayout */
export const mobileStandaloneRoutes = (
  <>
    <Route path="/mobile/presente" element={<MobilePresente />} />
    <Route path="/mobile/trial-expirado" element={<MobileTrialExpirado />} />
    <Route path="/mobile/pagamento-pendente" element={<MobilePagamentoPendente />} />
    <Route
      path="/mobile/onboarding-cadastro"
      element={
        <ProtectedRoute requireCompany={false}>
          <MobileOnboardingCadastro />
        </ProtectedRoute>
      }
    />
  </>
);

export const mobileAppRoutes = (
  <Route
    path="/mobile"
    element={
      <SuspenseBoundary>
        <ProtectedRoute>
          <MobileLayout />
        </ProtectedRoute>
      </SuspenseBoundary>
    }
  >
    <Route path="home" element={<MobileHome />} />
    <Route path="checklists" element={<MobileChecklists />} />
    <Route path="checklists/novo" element={<MobileChecklistNew />} />
    <Route path="checklists/:id" element={<MobileChecklistDetail />} />
    <Route path="checklists/:id/comparar" element={<MobileChecklistCompare />} />
    <Route path="checklist" element={<MobileChecklists />} />
    <Route path="frota" element={<MobileFrota />} />
    <Route path="pagamentos" element={<MobilePagamentos />} />
    <Route path="alugueis" element={<MobileAlugueis />} />
    <Route path="manutencao" element={<MobileManutencao />} />
    <Route path="manutencao/novo" element={<MobileManutencaoNew />} />
    <Route path="manutencao/:id" element={<MobileManutencaoDetalhe />} />
    <Route path="motoristas" element={<MobileMotoristas />} />
    <Route path="motoristas/:id" element={<MobileMotoristaDetalhe />} />
    <Route path="alertas" element={<MobileAlertas />} />
    <Route path="perfil" element={<MobilePerfil />} />
    <Route path="*" element={<Mobile404NotFound />} />
  </Route>
);
