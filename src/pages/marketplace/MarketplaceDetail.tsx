import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Star, ShieldCheck, MessageCircle, ChevronRight, Info, BadgeCheck, Loader2, X, ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHaptics } from "@/hooks/mobile/useHaptics";
import { getMarketplaceProduct, checkWishlist, toggleWishlist, incrementWhatsappClick } from "@/integrations/supabase/services/marketplaceService";
import { useAuth } from "@/integrations/supabase/auth";
import { toast } from "sonner";

const MarketplaceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { trigger } = useHaptics();
  const { user } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["marketplace-product", id],
    queryFn: () => getMarketplaceProduct(id!),
    enabled: Boolean(id),
  });

  const { data: isFavorited = false } = useQuery({
    queryKey: ["wishlist-check", id, user?.id],
    queryFn: () => checkWishlist(id!, user!.id),
    enabled: Boolean(id) && Boolean(user?.id),
  });

  const whatsappMutation = useMutation({
    mutationFn: () => incrementWhatsappClick(id!),
    onError: () => {},
  });

  const handleWhatsapp = () => {
    const phone = product?.seller?.whatsapp;
    if (!phone) {
      toast.error("Vendedor nao cadastrou WhatsApp.");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Tenho interesse no veículo ${product?.title} (R$ ${product?.price?.toLocaleString("pt-BR")}) que vi no DashiDrive.`
    );
    trigger("heavy");
    whatsappMutation.mutate();
    window.open(`https://wa.me/55${cleaned}?text=${message}`, "_blank");
  };

  const favoriteMutation = useMutation({
    mutationFn: () => toggleWishlist(id!, user!.id),
    onSuccess: (saved) => toast.success(saved ? "Anuncio salvo." : "Anuncio removido."),
    onError: (error: any) => toast.error(error.message || "Erro ao atualizar favorito."),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-black uppercase">Anuncio nao encontrado</h1>
          <Button onClick={() => navigate("/marketplace/home")}>Voltar ao marketplace</Button>
        </div>
      </div>
    );
  }

  const extraSpecs: { label: string; value: string }[] = [];
  if (product.garagem !== undefined) {
    extraSpecs.push({ label: "Garagem", value: product.garagem ? "Sim" : "Não" });
  }
  if (product.tempoPlataforma) {
    const labelMap: Record<string, string> = { "1+": "1+ ano", "3+": "3+ anos", "5+": "5+ anos" };
    extraSpecs.push({ label: "Tempo de Aplicativo", value: labelMap[product.tempoPlataforma] || product.tempoPlataforma });
  }

  const specs = [
    ...(product.specs?.length ? product.specs : [
      { label: "Condicao", value: product.condition },
      { label: "Categoria", value: product.category },
      { label: "Disponibilidade", value: product.status === "active" ? "Ativa" : product.status || "Consultar" },
      { label: "Propostas", value: String(product.proposals || 0) },
    ]),
    ...extraSpecs,
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => user?.id ? favoriteMutation.mutate() : toast.error("Entre para salvar favoritos.")}
            className={`w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-colors ${isFavorited ? "text-red-500" : "text-white"}`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </motion.button>
        </div>
      </nav>

      <div className="relative h-[50vh] w-full overflow-hidden">
        <motion.img initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} src={product.image} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <motion.main initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative -mt-10 px-4 space-y-8">
        <div className="p-6 rounded-[3rem] bg-card border border-white/5 shadow-neu space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest">
                  {product.category} - {product.condition}
                </Badge>
                {[product.city, product.state].filter(Boolean).length > 0 && (
                  <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-white/10 font-black text-[9px] uppercase tracking-widest gap-1">
                    <MapPin className="w-3 h-3" />
                    {[product.city, product.state].filter(Boolean).join(", ")}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-display font-black leading-none tracking-tighter uppercase">{product.title}</h1>
            </div>
            <div className="flex items-center gap-1 bg-muted/40 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
              <span className="text-xs font-black">{product.rating}</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Valor</span>
              <span className="text-4xl font-display font-black tracking-tight text-foreground">
                R$ {product.price.toLocaleString("pt-BR")}
                {product.period && <span className="text-sm text-muted-foreground ml-2 uppercase">/ {product.period}</span>}
              </span>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Ativo</Badge>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Fotos
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
            {product.images.map((img, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedImageIndex(i)}
                className="snap-start shrink-0"
              >
                <div className="w-72 h-48 rounded-3xl overflow-hidden bg-muted/30 border border-white/5">
                  <img src={img} alt={`${product.title} - Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Condicoes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {specs.map((spec, i) => (
              <div key={i} className="p-4 rounded-3xl bg-muted/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{spec.label}</span>
                <p className="text-sm font-black">{spec.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Detalhes
          </h2>
          <div className="p-6 rounded-[2.5rem] bg-muted/20 border border-white/5">
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">{product.description || "O vendedor ainda nao adicionou uma descricao detalhada."}</p>
          </div>
        </section>

        <section className="p-6 rounded-[3rem] bg-card border border-white/5 shadow-neu-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted p-1 border border-primary/20">
                <img src={product.seller?.avatar} alt="Seller" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {/* Exibe o nome da locadora (empresa) ao invés do usuário */}
                  <h3 className="text-sm font-black uppercase tracking-tighter">{product.seller?.companyName || product.seller?.name}</h3>
                  {product.seller?.isVerified && <BadgeCheck className="w-4 h-4 text-primary fill-current" />}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-[10px] font-bold text-muted-foreground">{product.seller?.rating} - Locadora Parceira</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
          </div>
          <Button size="lg" className="w-full h-14 rounded-2xl bg-[#25D366] text-white hover:bg-[#22c35e] font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-[#25D366]/20" onClick={handleWhatsapp}>
            <MessageCircle className="w-5 h-5 fill-current" />
            Falar no WhatsApp
          </Button>
        </section>
      </motion.main>

      {selectedImageIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) =>
                    prev === 0 ? product.images.length - 1 : prev! - 1
                  );
                }}
                className="absolute left-4 z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) =>
                    prev === product.images.length - 1 ? 0 : prev! + 1
                  );
                }}
                className="absolute right-4 z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <motion.img
            key={selectedImageIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={product.images[selectedImageIndex]}
            alt={`${product.title} - Foto ${selectedImageIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain px-4"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold uppercase tracking-widest">
            {selectedImageIndex + 1} / {product.images.length}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketplaceDetail;
