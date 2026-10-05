import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Eye, MessageCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CityAutocomplete } from "@/components/marketplace/CityAutocomplete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { useCompany } from "@/hooks/useCompany";
import { listMyMarketplaceAds, updateListingStatus, updateMarketplaceListing, checkPlanLimit } from "@/integrations/supabase/services/marketplaceService";
import { toast } from "sonner";
import { marcas } from "@/data/marcasModelos";
import { MKT_PLAN_LIMITS } from "@/data/planLimits";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const statusLabel: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  rented: "Alugado",
  sold: "Vendido",
  archived: "Arquivado",
  draft: "Rascunho",
};

const MarketplaceMyAds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingAd, setEditingAd] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    period: "",
    condition_label: "",
    marca: "",
    modelo: "",
    estado: "",
    cidade: "",
    garagem: false,
    arCondicionado: false,
  });

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["marketplace-my-ads", user?.id],
    queryFn: () => listMyMarketplaceAds(user!.id),
    enabled: Boolean(user?.id),
  });

  const { data: company } = useCompany();

  const { data: planInfo } = useQuery({
    queryKey: ["marketplace-plan-limit", company?.id],
    queryFn: () => checkPlanLimit(company!.id),
    enabled: Boolean(company?.id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateListingStatus(id, status),
    onSuccess: () => {
      toast.success("Anuncio atualizado.");
      queryClient.invalidateQueries({ queryKey: ["marketplace-my-ads"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao atualizar anuncio."),
  });

  const editMutation = useMutation({
    mutationFn: () =>
      updateMarketplaceListing(editingAd!.id, {
        title: editForm.title,
        description: editForm.description || null,
        price: editForm.price,
        period: editForm.period === "none" ? null : editForm.period,
        condition_label: editForm.condition_label,
      }),
    onSuccess: () => {
      toast.success("Anuncio atualizado.");
      setEditingAd(null);
      queryClient.invalidateQueries({ queryKey: ["marketplace-my-ads"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao salvar alteracoes."),
  });

  const openEdit = (ad: any) => {
    const getSpec = (label: string) => ad.marketplace_listing_specs?.find((s: any) => s.label === label)?.value || "";
    
    setEditForm({
      title: ad.title || "",
      description: ad.description || "",
      price: ad.price || 0,
      period: ad.period || "",
      condition_label: ad.condition || "",
      marca: getSpec("Marca"),
      modelo: getSpec("Modelo"),
      estado: ad.state || "",
      cidade: ad.city || "",
      garagem: ad.garagem || false,
      arCondicionado: getSpec("Ar Condicionado") === "Sim",
    });
    setEditingAd(ad);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-2xl border-b border-white/5 px-4 py-4 rounded-b-[2.5rem] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-black tracking-tighter uppercase leading-none">Meus Anuncios</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Gestao de Frota</p>
          </div>
        </div>
        <Button onClick={() => navigate("/marketplace/sell")} size="sm" className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Novo
        </Button>
      </header>

      <main className="px-4 pt-6 space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 px-1">
            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 space-y-1">
              <p className="text-2xl font-black text-primary">{ads.filter((ad: any) => ad.status === "active").length.toString().padStart(2, "0")}</p>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Anuncios Ativos</p>
            </div>
            <div className="p-4 rounded-3xl bg-muted/30 border border-white/5 space-y-1">
              <p className="text-2xl font-black">{ads.reduce((sum: number, ad: any) => sum + (ad.whatsappClicks || 0), 0)}</p>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Cliques WhatsApp</p>
            </div>
          </div>

          {planInfo && (
            <div className="px-1 pb-2">
              <div className="p-3 rounded-2xl bg-muted/20 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Limite do Plano {planInfo.plan}
                  </span>
                  <span className="text-[10px] font-black">
                    {planInfo.current}/{planInfo.limit} anúncios
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      planInfo.current >= planInfo.limit
                        ? "bg-destructive"
                        : planInfo.current >= planInfo.limit * 0.8
                          ? "bg-yellow-500"
                          : "bg-primary"
                    }`}
                    style={{ width: `${Math.min((planInfo.current / planInfo.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div className="space-y-4 pt-2">
            {ads.map((ad: any, i: number) => (
              <motion.div key={ad.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-[2.5rem] bg-card border border-white/5 shadow-neu-sm space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-black truncate uppercase tracking-tighter">{ad.title}</h3>
                      <button className="text-muted-foreground opacity-30 hover:opacity-100 transition-opacity" onClick={() => openEdit(ad)}>
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-black text-primary">R$ {ad.price.toLocaleString("pt-BR")} {ad.period && <span className="text-[10px] uppercase">/ {ad.period}</span>}</p>

                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[8px] font-black uppercase tracking-tighter px-1.5 py-0", ad.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground")}>
                        {statusLabel[ad.status || "active"] || ad.status}
                      </Badge>
                      <span className="text-[9px] font-bold text-muted-foreground italic">{ad.date?.slice(0, 10)}</span>
                    </div>
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
                  <Button variant="outline" className="flex-1 h-11 rounded-2xl border-2 border-primary/20 text-xs font-black uppercase tracking-widest" onClick={() => statusMutation.mutate({ id: ad.id, status: ad.status === "active" ? "paused" : "active" })}>
                    {ad.status === "active" ? "Pausar" : "Ativar"}
                  </Button>
                  <Button className="flex-1 h-11 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10" onClick={() => navigate("/marketplace/proposals")}>
                    Ver Leads
                  </Button>
                </div>
                <Button variant="ghost" className="w-full h-10 rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground" onClick={() => navigate(`/marketplace/inspections/${ad.id}`)}>
                    Ver Vistorias
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="p-6 rounded-[3rem] bg-muted/20 border-2 border-dashed border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest">Otimize seus Anuncios</h3>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Mantenha seu WhatsApp atualizado no perfil para receber consultas direto dos interessados.</p>
        </div>
      </main>

      <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <DialogContent className="rounded-[2rem] w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-muted">
          <DialogHeader>
            <DialogTitle>Editar Anuncio</DialogTitle>
            <DialogDescription>Altere as informacoes do anuncio e salve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titulo</Label>
              <Input id="edit-title" className="bg-white" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-marca">Marca</Label>
                <Select value={editForm.marca} onValueChange={(v) => setEditForm((f) => ({ ...f, marca: v, modelo: "" }))}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent className="bg-white z-[100]"><SelectItem value="none">Selecione</SelectItem>{marcas.map(m => <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-modelo">Modelo</Label>
                <Select value={editForm.modelo} onValueChange={(v) => setEditForm((f) => ({ ...f, modelo: v }))} disabled={!editForm.marca}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Modelo" /></SelectTrigger>
                  <SelectContent className="bg-white z-[100]">{marcas.find(m => m.nome === editForm.marca)?.modelos.map(mod => <SelectItem key={mod} value={mod}>{mod}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <Select value={editForm.estado} onValueChange={(v) => setEditForm((f) => ({ ...f, estado: v }))}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent className="bg-white z-[100]">{ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cidade">Cidade</Label>
                <CityAutocomplete className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={editForm.cidade} onChange={(v) => setEditForm((f) => ({ ...f, cidade: v }))} state={editForm.estado} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <Label htmlFor="edit-garagem">Necessário Garagem</Label>
              <Switch id="edit-garagem" checked={editForm.garagem} onCheckedChange={(v) => setEditForm((f) => ({ ...f, garagem: v }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descricao</Label>
              <Textarea id="edit-desc" className="bg-white" rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preco (R$)</Label>
              <Input id="edit-price" className="bg-white" type="number" step="0.01" min="0" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-period">Periodo</Label>
              <Select value={editForm.period} onValueChange={(v) => setEditForm((f) => ({ ...f, period: v }))}>
                <SelectTrigger id="edit-period" className="bg-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[100]">
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="dia">Dia</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condicao</Label>
              <Input id="edit-condition" className="bg-white" value={editForm.condition_label} onChange={(e) => setEditForm((f) => ({ ...f, condition_label: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)} disabled={editMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>
              {editMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceMyAds;
