import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const PlanSelection = lazy(() => import("@/pages/checkout/PlanSelection"));
const CheckoutGestaoBasico = lazy(() => import("@/pages/checkout/CheckoutGestaoBasico"));
const CheckoutGestaoPro = lazy(() => import("@/pages/checkout/CheckoutGestaoPro"));
const CheckoutGestaoMaster = lazy(() => import("@/pages/checkout/CheckoutGestaoMaster"));
const CheckoutMarketplaceFree = lazy(() => import("@/pages/checkout/CheckoutMarketplaceFree"));
const CheckoutMarketplacePro = lazy(() => import("@/pages/checkout/CheckoutMarketplacePro"));
const CheckoutMarketplaceElite = lazy(() => import("@/pages/checkout/CheckoutMarketplaceElite"));
const PlanosPage = lazy(() => import("@/pages/checkout/PlanosPage"));

export const checkoutRoutes = (
  <>
    <Route
      path="/checkout/plan"
      element={
        <ProtectedRoute>
          <PlanSelection />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/gestao-basico"
      element={
        <ProtectedRoute>
          <CheckoutGestaoBasico />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/gestao-pro"
      element={
        <ProtectedRoute>
          <CheckoutGestaoPro />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/gestao-master"
      element={
        <ProtectedRoute>
          <CheckoutGestaoMaster />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/marketplace-free"
      element={
        <ProtectedRoute>
          <CheckoutMarketplaceFree />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/marketplace-pro"
      element={
        <ProtectedRoute>
          <CheckoutMarketplacePro />
        </ProtectedRoute>
      }
    />
    <Route
      path="/checkout/marketplace-elite"
      element={
        <ProtectedRoute>
          <CheckoutMarketplaceElite />
        </ProtectedRoute>
      }
    />
    <Route path="/planos" element={<PlanosPage />} />
  </>
);
