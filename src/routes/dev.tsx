import { lazy } from "react";
import { Route } from "react-router-dom";
import { DevProtectedRoute } from "@/components/layout/DevProtectedRoute";
import { SuspenseBoundary } from "@/routes/SuspenseBoundary";

const DevLayout = lazy(() => import("@/layouts/dev/DevLayout"));
const DevOverview = lazy(() => import("@/pages/dev/Overview"));
const DevCompanies = lazy(() => import("@/pages/dev/Companies"));
const DevUsers = lazy(() => import("@/pages/dev/Users"));
const DevBilling = lazy(() => import("@/pages/dev/Billing"));
const DevAnalytics = lazy(() => import("@/pages/dev/Analytics"));
const DevLogs = lazy(() => import("@/pages/dev/Logs"));
const DevSystem = lazy(() => import("@/pages/dev/System"));
const DevFeatures = lazy(() => import("@/pages/dev/Features"));
const DevSupport = lazy(() => import("@/pages/dev/Support"));
const DevEvents = lazy(() => import("@/pages/dev/Events"));
const DevPlanManager = lazy(() => import("@/pages/dev/PlanManager"));
const DevWhatsApp = lazy(() => import("@/pages/dev/WhatsApp"));
const DevVeiculos = lazy(() => import("@/pages/dev/Veiculos"));
const DevBroadcast = lazy(() => import("@/pages/dev/Broadcast"));
const DevCoupons = lazy(() => import("@/pages/dev/Coupons"));
const DevSecurity = lazy(() => import("@/pages/dev/Security"));
const DevChatbot = lazy(() => import("@/pages/dev/Chatbot"));
const enableDevPanel =
  import.meta.env.VITE_ENABLE_DEV_PANEL === "true" || import.meta.env.DEV;

export const devRoutes = enableDevPanel ? (
  <Route
    path="/dev"
    element={
      <SuspenseBoundary>
        <DevProtectedRoute>
          <DevLayout />
        </DevProtectedRoute>
      </SuspenseBoundary>
    }
  >
    <Route index element={<DevOverview />} />
    <Route path="companies" element={<DevCompanies />} />
    <Route path="users" element={<DevUsers />} />
    <Route path="billing" element={<DevBilling />} />
    <Route path="analytics" element={<DevAnalytics />} />
    <Route path="logs" element={<DevLogs />} />
    <Route path="system" element={<DevSystem />} />
    <Route path="features" element={<DevFeatures />} />
    <Route path="support" element={<DevSupport />} />
    <Route path="events" element={<DevEvents />} />
    <Route path="plans" element={<DevPlanManager />} />
    <Route path="whatsapp" element={<DevWhatsApp />} />
    <Route path="veiculos" element={<DevVeiculos />} />
    <Route path="broadcast" element={<DevBroadcast />} />
    <Route path="coupons" element={<DevCoupons />} />
    <Route path="security" element={<DevSecurity />} />
    <Route path="chatbot" element={<DevChatbot />} />
  </Route>
) : null;
