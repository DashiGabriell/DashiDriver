import { Search, Bell, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const MarketplaceHeader = ({ title = "Marketplace", isSearchPage = false }: { title?: string, isSearchPage?: boolean }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl border-b border-white/5 px-4 py-4 rounded-b-[2.5rem]">
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
          onClick={() => navigate("/marketplace/home")}
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center cursor-pointer">
            <img src="/assets/cabeca.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <div className="cursor-pointer">
            <h1 className="text-xl font-display font-black tracking-tighter uppercase">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Premium Deals</p>
          </div>
        </motion.div>
        
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {!isSearchPage && (
        <div className="relative" onClick={() => navigate("/marketplace/search")}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <div className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted/40 flex items-center text-muted-foreground text-sm font-medium cursor-pointer">
            O que você está procurando?
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketplaceHeader;
