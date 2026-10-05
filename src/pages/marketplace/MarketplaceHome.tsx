import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import CategoryScroll, { CATEGORY_IMAGES } from "@/components/marketplace/CategoryScroll";
import type { CategoryItem } from "@/components/marketplace/CategoryScroll";
import ProductCard from "@/components/marketplace/ProductCard";
import HomeBanner from "@/components/marketplace/HomeBanner";
import AnimatedBanner from "@/components/marketplace/AnimatedBanner";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";
import { listMarketplaceProducts, toggleWishlist } from "@/integrations/supabase/services/marketplaceService";

const MarketplaceHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("marketplace_categories")
        .select("id, name")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const categoryItems = useMemo<CategoryItem[]>(() => {
    // Exclude unwanted categories: veiculos, Pecas, Servicos, Acessorios
    const excluded = ["veiculos", "pecas", "servicos", "acessorios"]; // lowercase for comparison
    const items: CategoryItem[] = [
      { id: "all", label: "Todos", image: "/assets/categorias-todas.png" },
    ];
    for (const cat of dbCategories) {
      const name = cat.name;
      if (excluded.includes(name.toLowerCase())) continue;
      items.push({
        id: cat.id,
        label: name,
        image: CATEGORY_IMAGES[name] || "/assets/carroPreto.png",
      });
    }
    return items;
  }, [dbCategories]);

  const { data: productsRes = { products: [] }, isLoading } = useQuery({
    queryKey: ["marketplace-products", selectedCategory],
    queryFn: () => listMarketplaceProducts({
      categoryId: selectedCategory === "all" ? null : selectedCategory,
    }),
  });
  const products = productsRes.products;

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => toggleWishlist(id, user!.id),
    onSuccess: (saved) => {
      toast.success(saved ? "Anuncio salvo nos favoritos." : "Anuncio removido dos favoritos.");
      queryClient.invalidateQueries({ queryKey: ["marketplace-wishlist"] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao atualizar favorito."),
  });

  const { data: newArrivalsRes = { products: [] }, isLoading: isLoadingNew } = useQuery({
    queryKey: ["marketplace-new-arrivals"],
    queryFn: () => listMarketplaceProducts({
      limit: 20,
      sortBy: 'newest',
    }),
  });
  const newArrivals = newArrivalsRes.products;

  const handleFavorite = (id: string) => {
    if (!user?.id) return toast.error("Entre para salvar favoritos.");
    favoriteMutation.mutate(id);
  };

  const featured = products.filter((p) => p.isFeatured);
  const gridProducts = products.filter((p) => !p.isFeatured || selectedCategory !== "all");

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="px-4 pt-6 space-y-8">
        <HomeBanner />
        
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <img src="/assets/carroPreto.png" alt="Explorar" className="w-4 h-4 object-contain" />
              Explorar Categorias
            </h2>
          </div>
          <CategoryScroll selected={selectedCategory} onSelect={setSelectedCategory} categories={categoryItems} />
        </section>

        <AnimatedBanner
          text="Anuncie sua frota e alcance milhares de motoristas!      -      "
          direction="left"
          bgColor="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        />

        {selectedCategory === "all" && featured.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Destaques para Locacao
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} item={p} index={i} onFavorite={handleFavorite} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <img src="/assets/carroPreto.png" alt="Oportunidades" className="w-4 h-4 object-contain" />
              Oportunidades
            </h2>
            <div className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-bold text-success uppercase tracking-widest">Confira</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gridProducts.map((p, i) => (
                <ProductCard key={p.id} item={p} index={i} onFavorite={handleFavorite} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <img src="/assets/carroPreto.png" alt="Novidades" className="w-4 h-4 object-contain" />
              Novidades
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x px-1">
            {newArrivals.map((p, i) => (
              <div key={`new-${p.id}`} className="min-w-[280px] snap-center">
                <ProductCard item={p} index={i} onFavorite={handleFavorite} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Modelos Mais Buscados
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 px-1">
            {["Argo", "Onix", "Gol", "HB20", "Corolla", "T-Cross"].map((modelo) => (
              <button
                key={modelo}
                onClick={() => navigate(`/marketplace/search?modelo=${modelo}`)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/30 border border-[#3c3c3c] hover:border-primary shadow-[0_0_10px_rgba(var(--primary),0.15)] hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all whitespace-nowrap"
              >
                <span className="text-xs font-black uppercase tracking-widest text-foreground">{modelo}</span>
              </button>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden p-8 rounded-[3rem] text-white shadow-2xl shadow-primary/20"
          style={{
            backgroundImage: `url('/assets/bg-anunciesuafrota-home-mktplc.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <img 
                src="/assets/carroPreto.png" 
                alt="Carro" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black leading-none tracking-tighter uppercase">Anuncie sua Frota</h3>
              <p className="mt-2 text-xs font-medium text-white/80 leading-relaxed">Sua locadora pode alcancar milhares de motoristas em todo o Brasil. Comece a locar hoje!</p>
            </div>
            <button 
              onClick={() => navigate('/marketplace/sell')}
              className="h-12 px-6 rounded-2xl bg-white text-primary font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Anunciar Veiculo
            </button>
          </div>
        </motion.div>
      </main>

      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceHome;
