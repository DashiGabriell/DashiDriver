import { Outlet, useLocation } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import { useMobileKeyboard } from "@/hooks/mobile/useMobileKeyboard";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { RouteFallback } from "@/routes/fallback";

export const MobileLayout = () => {
  const isMobile = useMobile();
  const { isKeyboardOpen } = useMobileKeyboard();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Área de Conteúdo Scrollável */}
      <main className="flex-1 overflow-y-auto pb-24 pt-safe safe-top">
        <div className="container px-4 py-6 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navegação Inferior Fixa */}
      {!isKeyboardOpen && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
