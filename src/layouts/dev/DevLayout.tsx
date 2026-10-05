import { useState, useCallback, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { DevSidebar } from "@/components/dev/DevSidebar";
import { DevHeader } from "@/components/dev/DevHeader";
import { DevMobileBottomNav } from "@/components/dev/DevMobileBottomNav";
import { RouteFallback } from "@/routes/fallback";

export default function DevLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="flex min-h-screen bg-background text-foreground pb-16 lg:pb-0">
      <DevSidebar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      <div className="flex-1 min-w-0 flex flex-col">
        <DevHeader onToggleSidebar={toggleSidebar} />
        <main className="p-4 lg:p-6 overflow-y-auto">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <DevMobileBottomNav onOpenSidebar={toggleSidebar} />
    </div>
  );
}
