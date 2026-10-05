import { useQuery } from "@tanstack/react-query";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import { motion } from "framer-motion";
import { MessageCircle, Eye, ArrowLeft, Copy, ExternalLink, Settings, Smartphone, Loader2, Clock, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { listMyMarketplaceAds, listWhatsappClickRecords } from "@/integrations/supabase/services/marketplaceService";
import { toast } from "sonner";

const MarketplaceProposals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { company } = useCarcontrolUser();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["marketplace-my-ads", user?.id],
    queryFn: () => listMyMarketplaceAds(user!.id),
    enabled: Boolean(user?.id),
  });

  const { data: clickRecords = [], isLoading: loadingClicks } = useQuery({
    queryKey: ["marketplace-whatsapp-clicks", company?.id],
    queryFn: () => listWhatsappClickRecords(company!.id, 30),
    enabled: Boolean(company?.id),
  });

  const totalClicks = ads.reduce((sum: number, ad: any) => sum + (ad.whatsappClicks || 0), 0);
  const totalViews = ads.reduce((sum: number, ad: any) => sum + (ad.views || 0), 0);

  const todayClicks = clickRecords.filter((r) => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const handleCopyLink = (ad: typeof ads[0]) => {
    const phone = ad.seller?.whatsapp;
    if (!phone) {
      toast.error("Cadastre seu WhatsApp no perfil primeiro.");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Tenho interesse no veículo ${ad.title} (R$ ${ad.price.toLocaleString("pt-BR")}) que vi no DashiDrive.`
    );
    const link = `https://wa.me/55${cleaned}?text=${message}`;
    navigator.clipboard.writeText(link);
    toast.success("Link do WhatsApp copiado!");
  };

  const handleOpenProfile = () => {
    navigate("/marketplace/profile");
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `Ha ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Ha ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Ha ${days} dia(s)`;
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl border-b border-white/5 px-4 py-4 rounded-b-[2.5rem] flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-display font-black tracking-tighter uppercase leading-none">Meus Leads</h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Consultas via WhatsApp</p>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-3 gap-3 px-1">
            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 space-y-1">
              <MessageCircle className="w-4 h-4 text-primary mb-1" />
              <p className="text-2xl font-black text-primary">{String(totalClicks).padStart(2, "0")}</p>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total</p>
            </div>
            <div className="p-4 rounded-3xl bg-success/5 border border-success/10 space-y-1">
              <Calendar className="w-4 h-4 text-success mb-1" />
              <p className="text-2xl font-black text-success">{String(todayClicks).padStart(2, "0")}</p>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Hoje</p>
            </div>
            <div className="p-4 rounded-3xl bg-muted/30 border border-white/5 space-y-1">
              <Eye className="w-4 h-4 text-muted-foreground mb-1" />
              <p className="text-2xl font-black">{String(totalViews).padStart(2, "0")}</p>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Vistas</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div className="space-y-4">
            {ads.map((ad: any, i: number) => (
              <motion.div key={ad.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-[2.5rem] bg-card border border-white/5 shadow-neu-sm space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black truncate uppercase tracking-tighter">{ad.title}</h3>
                    <p className="text-lg font-black text-primary mt-1">
                      R$ {ad.price.toLocaleString("pt-BR")}
                      {ad.period && <span className="text-[10px] text-muted-foreground uppercase"> / {ad.period}</span>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-black">{ad.views}</span>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Vistas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2">
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-black">{ad.whatsappClicks || 0}</span>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">WhatsApp</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-2xl border-2 border-primary/20 text-xs font-black uppercase tracking-widest gap-2" onClick={() => handleCopyLink(ad)}>
                    <Copy className="w-4 h-4" />
                    Copiar Link
                  </Button>
                  <Button className="flex-1 h-11 rounded-2xl bg-[#25D366] text-white hover:bg-[#22c35e] text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-[#25D366]/10" onClick={() => {
                    const phone = ad.seller?.whatsapp;
                    if (phone) {
                      const cleaned = phone.replace(/\D/g, "");
                      const message = encodeURIComponent(
                        `Olá! Tenho interesse no veículo ${ad.title} (R$ ${ad.price.toLocaleString("pt-BR")}) que vi no DashiDrive.`
                      );
                      window.open(`https://wa.me/55${cleaned}?text=${message}`, "_blank");
                    } else {
                      toast.error("Cadastre seu WhatsApp no perfil.");
                    }
                  }}>
                    <ExternalLink className="w-4 h-4" />
                    Testar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {clickRecords.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ultimos Contatos</h2>
              <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary ml-auto">
                {clickRecords.length} registros
              </Badge>
            </div>

            {loadingClicks && (
              <div className="flex justify-center py-8 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            <div className="space-y-2">
              {clickRecords.slice(0, 15).map((record, i) => (
                <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tighter">{record.listing_title}</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-0.5">{timeAgo(record.created_at)}</p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && ads.length === 0 && (
          <div className="p-10 rounded-[3rem] bg-muted/20 border-2 border-dashed border-white/5 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">Nenhum anuncio ativo</h3>
              <p className="text-[10px] text-muted-foreground font-medium px-4 mt-1 leading-relaxed">Crie um anuncio para comecar a receber consultas via WhatsApp.</p>
            </div>
            <button onClick={() => navigate("/marketplace/sell")} className="text-xs font-black text-primary uppercase tracking-tighter flex items-center gap-2 mx-auto active:scale-95 transition-transform">
              Anunciar Veiculo
            </button>
          </div>
        )}

        <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-3 cursor-pointer" onClick={handleOpenProfile}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest">Configurar WhatsApp</p>
          </div>
          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">Certifique-se de que seu numero de WhatsApp esta cadastrado no perfil da locadora para receber as consultas.</p>
        </div>
      </main>

      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceProposals;
