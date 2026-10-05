import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/mobile/useHaptics";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "/assets/loja.png", label: "Loja", path: "/marketplace/home" },
  { icon: "/assets/buscar.png", label: "Buscar", path: "/marketplace/search" },
  { icon: "/assets/cabeca.png", label: "Anunciar", path: "/marketplace/sell", center: true },
  { icon: "/assets/favoritos.png", label: "Favoritos", path: "/marketplace/wishlist" },
  { icon: "/assets/perfil3.png", label: "Perfil", path: "/marketplace/profile" },
];

export const MarketplaceBottomNav = () => {
  const { trigger } = useHaptics();
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl pb-safe-bottom z-50 flex items-center justify-around px-2 rounded-t-3xl border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)]"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => trigger("light")}
            className={cn(
              "relative flex flex-col items-center justify-center transition-all duration-300",
              item.center ? "w-16 h-16 mb-8" : "w-14 h-14"
            )}
          >
            {({ isActive }) => (
              <>
                {/* Background Neumorphic for center item or active state */}
                <AnimatePresence>
                  {(item.center || isActive) && (
                    <motion.div
                      layoutId="mkt-nav-bg"
                      className={cn(
                        "absolute inset-0 rounded-2xl z-0",
                        item.center 
                          ? "bg-accent shadow-neu-accent -top-4 w-16 h-16" 
                          : "bg-background shadow-neu-inset scale-90"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    />
                  )}
                </AnimatePresence>

                <div className={cn(
                  "relative z-10 flex flex-col items-center",
                  item.center && isActive ? "text-accent-foreground" : 
                  item.center ? "text-accent-foreground/80" :
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}>
                  <img 
                    src={item.icon} 
                    alt={item.label}
                    className={cn(
                      item.center ? "w-12 h-12 -mt-5" : "w-8 h-8 transition-transform",
                      isActive && !item.center && "animate-bounce-subtle"
                    )}
                  />
                  {!item.center && (
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Active Indicator Dot */}
                {isActive && !item.center && (
                  <motion.div
                    layoutId="mkt-active-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MarketplaceBottomNav;
