import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { PageTransitionLayout } from "@/components/layout/PageTransition";
import { gestaoRoutes, mobileAppRoutes, mobileStandaloneRoutes } from "@/products/core";
import { marketplaceRoutes, lojistaRoutes } from "@/products/satellite";
import { publicRoutes, checkoutRoutes, ajudaRoutes, devRoutes } from "@/products/platform";

const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * Specific area trees (/mobile, /marketplace, /dev) are registered BEFORE the
 * pathless PageTransition layout that contains the splat `*`, so they are not
 * swallowed by NotFound.
 *
 * Composition goes through src/products/* (Epic 14 product boundaries).
 */
export function AppRoutes() {
  return (
    <Routes>
      {mobileAppRoutes}
      {marketplaceRoutes}
      {devRoutes}

      <Route element={<PageTransitionLayout />}>
        {publicRoutes}
        {checkoutRoutes}
        {gestaoRoutes}
        {lojistaRoutes}
        {ajudaRoutes}
        {mobileStandaloneRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
