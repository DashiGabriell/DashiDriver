import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SuspenseBoundary } from "@/routes/SuspenseBoundary";

const MarketplaceLayout = lazy(() => import("@/layouts/marketplace/MarketplaceLayout"));
const MarketplaceHome = lazy(() => import("@/pages/marketplace/MarketplaceHome"));
const MarketplaceSearch = lazy(() => import("@/pages/marketplace/MarketplaceSearch"));
const MarketplaceDetail = lazy(() => import("@/pages/marketplace/MarketplaceDetail"));
const MarketplaceOrders = lazy(() => import("@/pages/marketplace/MarketplaceOrders"));
const MarketplaceProfile = lazy(() => import("@/pages/marketplace/MarketplaceProfile"));
const MarketplaceSell = lazy(() => import("@/pages/marketplace/MarketplaceSell"));
const MarketplaceMyAds = lazy(() => import("@/pages/marketplace/MarketplaceMyAds"));
const MarketplaceProposals = lazy(() => import("@/pages/marketplace/MarketplaceProposals"));
const InspectionPage = lazy(() => import("@/pages/marketplace/Inspection"));
const InspectionsListPage = lazy(() => import("@/pages/marketplace/InspectionsList"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * Marketplace: módulo em pausa, mantido para retomada futura.
 * Estado atual, lacunas e ordem de retomada: planejamento/MARKETPLACE-ESTADO-ATUAL.md
 */
export const marketplaceRoutes = (
  <Route
    path="/marketplace"
    element={
      <SuspenseBoundary>
        <ProtectedRoute>
          <MarketplaceLayout />
        </ProtectedRoute>
      </SuspenseBoundary>
    }
  >
    <Route path="home" element={<MarketplaceHome />} />
    <Route path="search" element={<MarketplaceSearch />} />
    <Route path="detail/:id" element={<MarketplaceDetail />} />
    <Route path="sell" element={<MarketplaceSell />} />
    <Route path="wishlist" element={<MarketplaceOrders />} />
    <Route path="profile" element={<MarketplaceProfile />} />
    <Route path="my-ads" element={<MarketplaceMyAds />} />
    <Route path="proposals" element={<MarketplaceProposals />} />
    <Route path="inspection/:listingId" element={<InspectionPage />} />
    <Route path="inspections/:listingId" element={<InspectionsListPage />} />
    <Route path="*" element={<NotFound />} />
  </Route>
);
