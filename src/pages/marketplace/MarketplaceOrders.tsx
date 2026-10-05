import { useQuery } from "@tanstack/react-query";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import { motion } from "framer-motion";
import { Heart, Clock, ArrowRight, ShoppingBag, MessageCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/integrations/supabase/auth";
import { listWishlist } from "@/integrations/supabase/services/marketplaceService";
import { useNavigate } from "react-router-dom";

const MarketplaceOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["marketplace-wishlist", user?.id],
    queryFn: () => listWishlist(user!.id),
    enabled: Boolean(user?.id),
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="px-4 pt-6 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Favoritos</h2>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div className="space-y-3">
            {wishlist.map((item: any, i: number) => (
              <motion.div key={`wishlist-${item.id}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} onClick={() => item.listingId && navigate(`/marketplace/detail/${item.listingId}`)} className="p-4 rounded-[2rem] bg-card border border-white/5 shadow-neu-sm flex gap-4 items-center cursor-pointer">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black truncate uppercase tracking-tighter">{item.title}</h3>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0">
                      Salvo
                    </Badge>
                  </div>
                  <p className="text-lg font-black text-primary">R$ {item.price.toLocaleString("pt-BR")}</p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-widest">
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {!isLoading && wishlist.length === 0 && (
          <div className="p-10 rounded-[3rem] bg-muted/20 border-2 border-dashed border-white/5 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Nenhum favorito ainda</h3>
              <p className="text-[10px] text-muted-foreground font-medium px-4 mt-1 leading-relaxed">Salve veiculos que te interessam e entre em contato direto pelo WhatsApp com o vendedor.</p>
            </div>
            <button onClick={() => navigate("/marketplace/home")} className="text-xs font-black text-primary uppercase tracking-tighter flex items-center gap-2 mx-auto active:scale-95 transition-transform">
              Explorar Veiculos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceOrders;
