import { Outlet, useLocation } from "react-router-dom";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { RouteFallback } from "@/routes/fallback";

export const MarketplaceLayout = () => {
  const { isKeyboardOpen } = useMobileKeyboard();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-safe safe-bottom">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Bottom Nav */}
      {!isKeyboardOpen && <MarketplaceBottomNav />}
    </div>
  );
};

export default MarketplaceLayout;
