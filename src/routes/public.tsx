import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const Landing = lazy(() => import("@/pages/Landing"));
const MarketplaceLanding = lazy(() => import("@/pages/MarketplaceLanding"));
const Login = lazy(() => import("@/pages/Login"));
const BemVindo = lazy(() => import("@/pages/BemVindo"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const AcceptInvite = lazy(() => import("@/pages/AcceptInvite"));
const VistoriaCompartilhada = lazy(() => import("@/pages/VistoriaCompartilhada"));

export const publicRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="/lp-marketplace" element={<MarketplaceLanding />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/bem-vindo"
      element={
        <ProtectedRoute requireCompany={false}>
          <BemVindo />
        </ProtectedRoute>
      }
    />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute requireCompany={false}>
          <Onboarding />
        </ProtectedRoute>
      }
    />
    <Route path="/aceitar-convite" element={<AcceptInvite />} />
    <Route path="/vistoria/:token" element={<VistoriaCompartilhada />} />
  </>
);
