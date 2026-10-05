import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { PageTransitionLayout } from "@/components/layout/PageTransition";
import { gestaoRoutes, acessoRoutes } from "@/products/core";
import { marketplaceRoutes } from "@/products/satellite";
import { publicRoutes, checkoutRoutes, ajudaRoutes, devRoutes } from "@/products/platform";

const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * Specific area trees (/marketplace, /dev) are registered BEFORE the
 * pathless PageTransition layout that contains the splat `*`, so they are not
 * swallowed by NotFound.
 *
 * Composition goes through src/products/* (Epic 14 product boundaries).
 */
export function AppRoutes() {
  return (
    <Routes>
      {marketplaceRoutes}
      {devRoutes}

      <Route element={<PageTransitionLayout />}>
        {publicRoutes}
        {checkoutRoutes}
        {gestaoRoutes}
        {ajudaRoutes}
        {acessoRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
