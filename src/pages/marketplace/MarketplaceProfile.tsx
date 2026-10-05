import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Settings, Package, BarChart3, ChevronRight, ShieldCheck, Star, PlusCircle, LogOut, Loader2, Save, Phone, MapPin, Building2, FileText, Mail, User, Hash, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { listMyMarketplaceAds, getSellerProfile, upsertSellerProfile, updateCompany, uploadSellerAvatar, listSentProposals, listWishlist } from "@/integrations/supabase/services/marketplaceService";
import { toast } from "sonner";

const MarketplaceProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, company, userRole, refreshProfile } = useCarcontrolUser();
  // carcontrol_profiles não tem coluna própria para WhatsApp
  const profilePreferencias = ((profile as { preferencias?: unknown } | null)?.preferencias ?? {}) as Record<string, unknown>;
  const driverWhatsapp = typeof profilePreferencias.whatsapp === "string" ? profilePreferencias.whatsapp : "";
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const isDriver = !company && userRole === "user";

  const { data: sellerProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["marketplace-seller-profile", user?.id],
    queryFn: () => getSellerProfile(user!.id),
    enabled: Boolean(user?.id) && !isDriver,
  });

  const displayName = profile?.nome || user?.user_metadata?.full_name || company?.nome || "Dashi Admin";
  const avatar = sellerProfile?.avatar_url || profile?.avatar_url || user?.user_metadata?.avatar_url || "/assets/cabeca.png";

  const { data: ads = [] } = useQuery({
    queryKey: ["marketplace-my-ads", user?.id],
    queryFn: () => listMyMarketplaceAds(user!.id),
    enabled: Boolean(user?.id) && !isDriver,
  });

  const totalWhatsappClicks = ads.reduce((sum: number, ad: any) => sum + (ad.whatsappClicks || 0), 0);

  const { data: sentProposals = [] } = useQuery({
    queryKey: ["marketplace-sent-proposals", user?.id],
    queryFn: () => listSentProposals(user!.id),
    enabled: Boolean(user?.id) && isDriver,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["marketplace-wishlist", user?.id],
    queryFn: () => listWishlist(user!.id),
    enabled: Boolean(user?.id) && isDriver,
  });

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    whatsapp: "",
    phone: "",
    city: "",
    state: "",
    company_name: "",
    company_cnpj: "",
    company_email: "",
    company_phone: "",
    company_address: "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDriver) {
      setForm((prev) => ({
        ...prev,
        display_name: (profile as any)?.full_name || profile?.nome || user?.user_metadata?.full_name || "",
        whatsapp: driverWhatsapp,
      }));
      return;
    }
    if (sellerProfile) {
      setForm((prev) => ({
        ...prev,
        display_name: sellerProfile.display_name || "",
        bio: sellerProfile.bio || "",
        whatsapp: sellerProfile.whatsapp || "",
        phone: sellerProfile.phone || "",
        city: sellerProfile.city || "",
        state: sellerProfile.state || "",
      }));
    }
    if (company) {
      setForm((prev) => ({
        ...prev,
        company_name: company.nome || "",
        company_cnpj: company.cnpj || "",
        company_email: company.email || "",
        company_phone: company.telefone || "",
        company_address: company.endereco || "",
      }));
    }
  }, [isDriver, sellerProfile, company, profile, user, driverWhatsapp]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isDriver) {
        const { error } = await (supabase as any)
          .from("carcontrol_profiles")
          .update({
            full_name: form.display_name || undefined,
            preferencias: { ...profilePreferencias, whatsapp: form.whatsapp || null },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user!.id);
        if (error) throw error;
        await refreshProfile();
        return;
      }
      if (company?.id) {
        await updateCompany(company.id, {
          nome: form.company_name || undefined,
          cnpj: form.company_cnpj || null,
          email: form.company_email || null,
          telefone: form.company_phone || null,
          endereco: form.company_address || null,
        });
      }
      if (user?.id && company?.id) {
        await upsertSellerProfile(user.id, company.id, {
          display_name: form.display_name || undefined,
          bio: form.bio || null,
          whatsapp: form.whatsapp || null,
          phone: form.phone || null,
          city: form.city || null,
          state: form.state || null,
        });
      }
    },
    onSuccess: () => {
      toast.success("Informacoes salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["marketplace-seller-profile"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-my-ads"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-sent-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-wishlist"] });
      setEditOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Erro ao salvar informacoes."),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarUploading(true);
    try {
      const url = await uploadSellerAvatar(user.id, file);
      if (isDriver) {
        await (supabase as any)
          .from("carcontrol_profiles")
          .update({ avatar_url: url, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        await queryClient.invalidateQueries({ queryKey: ["marketplace-sent-proposals"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["marketplace-seller-profile"] });
      }
      toast.success("Foto alterada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar foto.");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {isDriver ? (
        <>
          <div className="relative pt-12 pb-20 px-4 bg-gradient-to-b from-primary/10 to-transparent rounded-b-[4rem]">
            <div className="flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                <div className="w-24 h-24 rounded-full bg-card p-1 shadow-neu ring-2 ring-primary/20 overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                </div>
                <Badge className="absolute -bottom-2 -right-2 bg-primary text-white border-2 border-background px-3 py-1 text-[10px] font-black uppercase">
                  Motorista
                </Badge>
              </motion.div>
              <div className="text-center">
                <h1 className="text-2xl font-display font-black tracking-tighter uppercase leading-none">{displayName}</h1>
                <p className="text-xs text-muted-foreground font-bold mt-2 uppercase tracking-widest">Marketplace DashiDrive</p>
              </div>
              <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                <UserCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-tighter">Perfil de Motorista</span>
              </div>
            </div>
          </div>

          <main className="px-4 -mt-10 space-y-6">
            <section className="grid grid-cols-2 gap-3">
              {[
                { label: "Contatos Enviados", value: String(sentProposals.length), iconSrc: "/assets/whatsapp.png" },
                { label: "Favoritos", value: String(wishlist.length), iconSrc: "/assets/favoritos.png" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-[2rem] bg-card border border-white/5 shadow-neu-sm text-center space-y-1">
                  <img src={stat.iconSrc} alt="" className="w-5 h-5 mx-auto object-contain opacity-50" />
                  <p className="text-lg font-black tracking-tight">{stat.value}</p>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Minha Atividade</h2>
              <div className="rounded-[2.5rem] bg-card border border-white/5 shadow-neu overflow-hidden">
                {[
                  { label: "Minhas Propostas", iconSrc: "/assets/whatsapp.png", path: "/marketplace/proposals" },
                  // TODO(marketplace): rota real é /marketplace/wishlist (MARKETPLACE-ESTADO-ATUAL.md, item 3.5).
                  { label: "Meus Favoritos", iconSrc: "/assets/favoritos.png", path: "/marketplace/favorites" },
                  { label: "Editar Perfil", iconSrc: "/assets/configuracoes.png", action: () => setEditOpen(true) },
                ].map((item, i) => (
                  <button key={i} onClick={() => { if ("path" in item && item.path !== "#") navigate(item.path!); else if ("action" in item) item.action?.(); }} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 active:bg-muted/50 transition-colors border-b border-white/5 last:border-0 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <img src={item.iconSrc} alt="" className="w-5 h-5 object-contain" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-4 space-y-4">
              <button onClick={signOut} className="w-full h-16 rounded-[2rem] border-2 border-white/5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground active:scale-95 transition-all">
                <LogOut className="w-5 h-5" />
                Sair do Marketplace
              </button>
              <p className="text-center text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Marketplace Module v1.0</p>
            </div>
          </main>

          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetContent side="bottom" className="rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left text-lg font-display font-black uppercase tracking-tighter">Meu Perfil</SheetTitle>
                <SheetDescription className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Atualize suas informacoes pessoais
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 pb-8">
                <div className="flex items-center gap-4 pb-2">
                  <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden border border-primary/20 shrink-0">
                    <img src={avatar} alt="Foto" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <Button type="button" variant="outline" size="sm" className="rounded-xl h-10 text-xs font-black" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                      {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alterar Foto"}
                    </Button>
                    <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">JPG, PNG ou WEBP. Max 10MB.</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Nome Completo</label>
                  <Input value={form.display_name} onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))} placeholder="Seu nome" className="rounded-2xl h-12 bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">WhatsApp</label>
                  <Input value={(() => {
                    const d = form.whatsapp.replace(/\D/g, "");
                    if (d.length <= 2) return d;
                    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
                    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
                  })()} onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm((prev) => ({ ...prev, whatsapp: raw }));
                  }} placeholder="(11) 99999-8888" className="rounded-2xl h-12 bg-white" />
                </div>
                <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Salvar Informacoes
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          <div className="relative pt-12 pb-20 px-4 bg-gradient-to-b from-primary/10 to-transparent rounded-b-[4rem]">
            <div className="flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                <div className="w-24 h-24 rounded-[2.5rem] bg-card p-1 shadow-neu ring-2 ring-primary/20 overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={avatar} alt="Profile" className="w-full h-full object-contain" />
                </div>
                <Badge className="absolute -bottom-2 -right-2 bg-primary text-white border-2 border-background px-3 py-1 text-[10px] font-black uppercase">
                  {company?.mkt_plan || "FREE"}
                </Badge>
              </motion.div>

              <div className="text-center">
                <h1 className="text-2xl font-display font-black tracking-tighter uppercase leading-none">{displayName}</h1>
                <p className="text-xs text-muted-foreground font-bold mt-2 uppercase tracking-widest">{company?.nome || "Marketplace DashiDrive"}</p>
              </div>

              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  <span className="text-xs font-black">5.0</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-tighter">Verificado</span>
                </div>
              </div>
            </div>
          </div>

          <main className="px-4 -mt-10 space-y-6">
            <section className="grid grid-cols-3 gap-3">
              {[
                { label: "Anuncios", value: String(ads.length), icon: Package },
                { label: "Leads", value: String(totalWhatsappClicks), icon: MessageCircle },
                { label: "Visualizacoes", value: String(ads.reduce((s: number, a: any) => s + (a.views || 0), 0)), icon: BarChart3 },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-[2rem] bg-card border border-white/5 shadow-neu-sm text-center space-y-1">
                  <stat.icon className="w-4 h-4 mx-auto text-primary opacity-50" />
                  <p className="text-lg font-black tracking-tight">{stat.value}</p>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Gerenciamento</h2>
              <div className="rounded-[2.5rem] bg-card border border-white/5 shadow-neu overflow-hidden">
                {[
                  { label: "Meus Anuncios", icon: Package, color: "text-blue-500", path: "/marketplace/my-ads" },
                  { label: "Meus Leads", icon: MessageCircle, color: "text-green-500", path: "/marketplace/proposals" },
                  { label: "Disponibilizar Veiculo", icon: PlusCircle, color: "text-primary", path: "/marketplace/sell" },
                  { label: "Configuracoes da Locadora", icon: Settings, color: "text-accent", action: () => setEditOpen(true) },
                ].map((item, i) => (
                  <button key={i} onClick={() => { if ("path" in item && item.path !== "#") navigate(item.path!); else if ("action" in item) item.action?.(); }} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 active:bg-muted/50 transition-colors border-b border-white/5 last:border-0 text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-4 space-y-4">
              <button onClick={signOut} className="w-full h-16 rounded-[2rem] border-2 border-white/5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground active:scale-95 transition-all">
                <LogOut className="w-5 h-5" />
                Sair do Marketplace
              </button>
              <p className="text-center text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Marketplace Module v1.0</p>
            </div>
          </main>

          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetContent side="bottom" className="rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left text-lg font-display font-black uppercase tracking-tighter">Configuracoes da Locadora</SheetTitle>
                <SheetDescription className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Preencha as informacoes da sua locadora
                </SheetDescription>
              </SheetHeader>

              {loadingProfile ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6 pb-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Perfil da Locadora
                    </h3>
                    <div className="flex items-center gap-4 pb-2">
                      <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden border border-primary/20 shrink-0">
                        <img src={sellerProfile?.avatar_url || avatar} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <Button type="button" variant="outline" size="sm" className="rounded-xl h-10 text-xs font-black" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                          {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alterar Foto"}
                        </Button>
                        <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">JPG, PNG ou WEBP. Max 10MB.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Nome da Locadora</label>
                        <Input value={form.display_name} onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))} placeholder="Ex: DashiDrive Locadora" className="rounded-2xl h-12 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Bio / Descricao</label>
                        <Textarea value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="Conte um pouco sobre sua locadora..." className="rounded-2xl min-h-[80px] bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><Phone className="w-3 h-3" />WhatsApp</label>
                          <Input value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} placeholder="(11) 99999-8888" className="rounded-2xl h-12 bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</label>
                          <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="(11) 3000-0000" className="rounded-2xl h-12 bg-white" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" />Cidade</label>
                          <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="Sao Paulo" className="rounded-2xl h-12 bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">UF</label>
                          <Input value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} placeholder="SP" maxLength={2} className="rounded-2xl h-12 uppercase bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/5" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" />
                      Dados da Empresa
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Razao Social</label>
                        <Input value={form.company_name} onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))} placeholder="Nome da empresa" className="rounded-2xl h-12 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><Hash className="w-3 h-3" />CNPJ</label>
                        <Input value={form.company_cnpj} onChange={(e) => setForm((prev) => ({ ...prev, company_cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="rounded-2xl h-12 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><Mail className="w-3 h-3" />E-mail</label>
                        <Input value={form.company_email} onChange={(e) => setForm((prev) => ({ ...prev, company_email: e.target.value }))} placeholder="contato@locadora.com" type="email" className="rounded-2xl h-12 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</label>
                        <Input value={form.company_phone} onChange={(e) => setForm((prev) => ({ ...prev, company_phone: e.target.value }))} placeholder="(11) 3000-0000" className="rounded-2xl h-12 bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block flex items-center gap-1"><MapPin className="w-3 h-3" />Endereco</label>
                        <Input value={form.company_address} onChange={(e) => setForm((prev) => ({ ...prev, company_address: e.target.value }))} placeholder="Av. Paulista, 1000" className="rounded-2xl h-12 bg-white" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Informacoes
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceProfile;
