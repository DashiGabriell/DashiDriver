import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { marcas } from "@/data/marcasModelos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import CategoryScroll, { CATEGORY_IMAGES } from "@/components/marketplace/CategoryScroll";
import type { CategoryItem } from "@/components/marketplace/CategoryScroll";
import ProductCard from "@/components/marketplace/ProductCard";
import { CityAutocomplete } from "@/components/marketplace/CityAutocomplete";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";
import { listMarketplaceProducts, toggleWishlist } from "@/integrations/supabase/services/marketplaceService";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const MarketplaceSearch = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [cambio, setCambio] = useState<string | null>(null);
  const [combustivel, setCombustivel] = useState<string | null>(null);
  const [arCondicionado, setArCondicionado] = useState<boolean | null>(null);
  const [garagem, setGaragem] = useState<boolean | null>(null);
  const [tempoPlataforma, setTempoPlataforma] = useState<string | null>(null);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState(searchParams.get("modelo") || "");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (modelo) {
      // Registrar log de busca
      supabase.from("marketplace_search_logs").insert({ modelo, user_id: user?.id }).then();
      
      // Tentar encontrar a marca baseada no modelo
      const marcaEncontrada = marcas.find(m => m.modelos.includes(modelo))?.nome;
      if (marcaEncontrada) setMarca(marcaEncontrada);
    }
  }, [modelo]);

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
      if (excluded.includes(cat.name.toLowerCase())) continue;
      items.push({
        id: cat.id,
        label: cat.name,
        image: CATEGORY_IMAGES[cat.name] || "/assets/carroPreto.png",
      });
    }
    return items;
  }, [dbCategories]);

  const queryFilters = useMemo(() => ({
    search: searchTerm || undefined,
    categoryId: selectedCategory === "all" ? null : selectedCategory,
    condition: selectedCondition || undefined,
    maxPrice: maxPrice || undefined,
    cambio: cambio || undefined,
    combustivel: combustivel || undefined,
    arCondicionado: arCondicionado ?? undefined,
    garagem: garagem ?? undefined,
    tempoPlataforma: tempoPlataforma || undefined,
    marca: marca || undefined,
    modelo: modelo || undefined,
    city: cidade || undefined,
    state: estado || undefined,
    page,
    pageSize: 10,
  }), [searchTerm, selectedCategory, selectedCondition, maxPrice, cambio, combustivel, arCondicionado, garagem, tempoPlataforma, marca, modelo, cidade, estado, page]);

  const { data: searchRes = { products: [], total: 0 }, isLoading } = useQuery({
    queryKey: ["marketplace-search", queryFilters],
    queryFn: () => listMarketplaceProducts(queryFilters),
  });
  const filteredProducts = searchRes.products;
  const totalResults = searchRes.total;
  const totalPages = Math.max(1, Math.ceil(totalResults / 10));

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => toggleWishlist(id, user!.id),
    onSuccess: () => {
      toast.success("Favoritos atualizados.");
      queryClient.invalidateQueries({ queryKey: ["marketplace-wishlist"] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao atualizar favorito."),
  });

  const clearFilters = () => {
    setSearchTerm("");
    setMarca("");
    setModelo("");
    setCidade("");
    setEstado("");
    setSelectedCategory("all");
    setSelectedCondition(null);
    setMaxPrice(5000);
    setCambio(null);
    setCombustivel(null);
    setArCondicionado(null);
    setGaragem(null);
    setTempoPlataforma(null);
    setPage(1);
  };

  const handleFavorite = (id: string) => {
    if (!user?.id) return toast.error("Entre para salvar favoritos.");
    favoriteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 py-4 space-y-4 bg-background/60 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/5 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Pesquisar veículos por modelo, marca..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)} className="h-12 w-12 rounded-2xl border-white/10 bg-muted/30">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <CategoryScroll selected={selectedCategory} onSelect={(id) => { setSelectedCategory(id); setPage(1); }} categories={categoryItems} />
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[3rem] z-[70] p-8 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-display font-black uppercase tracking-tighter">Filtros Avançados</h2>
                <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Marca</p>
                  <Select value={marca} onValueChange={(v) => { setMarca(v); setModelo(""); }}>
                    <SelectTrigger className="w-full h-12 px-4 rounded-2xl bg-muted/20 border text-sm">
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[100]">
                      {marcas.map((m) => (
                        <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Modelo</p>
                  <Select value={modelo} onValueChange={setModelo} disabled={!marca}>
                    <SelectTrigger className="w-full h-12 px-4 rounded-2xl bg-muted/20 border text-sm">
                      <SelectValue placeholder={marca ? "Selecione o modelo" : "Escolha a marca primeiro"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[100]">
                      {marcas.find((m) => m.nome === marca)?.modelos.map((mod) => (
                        <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Estado</p>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger className="w-full h-12 px-4 rounded-2xl bg-muted/20 border text-sm">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[100]">
                        {ESTADOS_BR.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Cidade</p>
                    <CityAutocomplete
                      value={cidade}
                      onChange={setCidade}
                      state={estado}
                      placeholder="Ex: São Paulo"
                      className="w-full h-12 px-4 rounded-2xl bg-muted/20 border text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor Semanal Máximo (R$)</p>
                    <span className="text-sm font-black text-primary">R$ {maxPrice}</span>
                  </div>
                  <input type="range" min="100" max="5000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Câmbio</p>
                  <div className="flex gap-2">
                    {["manual", "automatico"].map((c) => (
                      <button key={c} onClick={() => setCambio(cambio === c ? null : c)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${cambio === c ? "bg-primary text-white" : "bg-muted/20"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Combustível</p>
                  <div className="flex flex-wrap gap-2">
                    {["flex", "gasolina", "etanol", "diesel", "hibrido", "eletrico"].map((c) => (
                      <button key={c} onClick={() => setCombustivel(combustivel === c ? null : c)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${combustivel === c ? "bg-primary text-white" : "bg-muted/20"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Geral</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setArCondicionado(arCondicionado === true ? null : true)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${arCondicionado === true ? "bg-primary text-white" : "bg-muted/20"}`}>
                      Ar Condicionado
                    </button>
                    <button onClick={() => setGaragem(garagem === true ? null : true)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${garagem === true ? "bg-primary text-white" : "bg-muted/20"}`}>
                      Garagem
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tempo na Plataforma</p>
                  <div className="flex flex-wrap gap-2">
                    {["1+", "3+", "5+"].map((t) => (
                      <button key={t} onClick={() => setTempoPlataforma(tempoPlataforma === t ? null : t)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${tempoPlataforma === t ? "bg-primary text-white" : "bg-muted/20"}`}>
                        {t} anos
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" onClick={clearFilters} className="flex-1 h-14 rounded-2xl border-2 border-muted font-black text-xs uppercase tracking-widest">Limpar</Button>
                  <Button onClick={() => { setPage(1); setIsFilterOpen(false); }} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Aplicar</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {totalResults} {totalResults === 1 ? "Resultado" : "Resultados"} encontrados
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <ProductCard item={p} index={i} onFavorite={handleFavorite} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 pb-4">
                <p className="text-[10px] text-muted-foreground font-medium">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-muted/20 disabled:opacity-30"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-primary text-white disabled:opacity-30"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-[2.5rem] bg-muted/30 flex items-center justify-center border-2 border-dashed border-white/5">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Nenhum resultado</h3>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Tente ajustar seus filtros ou pesquisar por outros termos.</p>
            </div>
            <Button variant="link" onClick={clearFilters} className="text-xs font-black uppercase text-primary">Limpar todos os filtros</Button>
          </motion.div>
        )}
      </main>

      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceSearch;
