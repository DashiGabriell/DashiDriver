import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const Checkout = lazy(() => import("@/pages/checkout/Checkout"));
const PlanosPage = lazy(() => import("@/pages/checkout/PlanosPage"));

export const checkoutRoutes = (
  <>
    <Route path="/checkout/plan" element={<Navigate to="/planos" replace />} />
    <Route
      path="/checkout/:plano"
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      }
    />
    <Route path="/planos" element={<PlanosPage />} />
  </>
);
