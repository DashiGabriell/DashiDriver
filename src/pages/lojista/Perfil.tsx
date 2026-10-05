import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/integrations/supabase/auth";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { getSellerProfile, upsertSellerProfile, updateCompany, uploadSellerAvatar } from "@/integrations/supabase/services/marketplaceService";
import { toast } from "sonner";
import { Loader2, Save, User, Phone, MapPin, Building2, Mail, Hash, Camera } from "lucide-react";

const Perfil = () => {
  const { user } = useAuth();
  const { profile, company } = useCarcontrolUser();
  const queryClient = useQueryClient();

  const { data: sellerProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["lojista-seller-profile", user?.id],
    queryFn: () => getSellerProfile(user!.id),
    enabled: Boolean(user?.id),
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
  }, [sellerProfile, company]);

  const avatar = sellerProfile?.avatar_url || profile?.avatar_url || user?.user_metadata?.avatar_url || "/assets/cabeca.png";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarUploading(true);
    try {
      await uploadSellerAvatar(user.id, file);
      queryClient.invalidateQueries({ queryKey: ["lojista-seller-profile"] });
      toast.success("Foto alterada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar foto.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ["lojista-seller-profile"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-seller-profile"] });
    },
    onError: (error: any) => toast.error(error.message || "Erro ao salvar informacoes."),
  });

  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-display font-black uppercase tracking-tighter">Meu Perfil</h1>
        <Card className="neu p-6 rounded-3xl max-w-4xl border border-white/5 shadow-neu">
          <CardContent className="space-y-6">
            {loadingProfile ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                  <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden border border-primary/20 shrink-0">
                    <img src={avatar} alt="Foto" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <Button variant="outline" size="sm" className="rounded-xl h-10 text-xs font-black gap-2" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                      {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      Alterar Foto
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">JPG, PNG ou WEBP. Max 10MB.</p>
                  </div>
                </div>

                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Perfil da Locadora
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome da Locadora</Label>
                    <Input value={form.display_name} onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))} placeholder="Ex: DashiDrive Locadora" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />WhatsApp</Label>
                    <Input value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="(11) 99999-8888" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(11) 3000-0000" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Cidade</Label>
                    <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Sao Paulo" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UF</Label>
                    <Input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="SP" maxLength={2} className="rounded-2xl h-12 uppercase" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio / Descricao</Label>
                    <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Conte um pouco sobre sua locadora..." className="rounded-2xl min-h-[80px]" />
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Razao Social</Label>
                    <Input value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} placeholder="Nome da empresa" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" />CNPJ</Label>
                    <Input value={form.company_cnpj} onChange={(e) => setForm((p) => ({ ...p, company_cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />E-mail</Label>
                    <Input value={form.company_email} onChange={(e) => setForm((p) => ({ ...p, company_email: e.target.value }))} placeholder="contato@locadora.com" type="email" className="rounded-2xl h-12" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</Label>
                    <Input value={form.company_phone} onChange={(e) => setForm((p) => ({ ...p, company_phone: e.target.value }))} placeholder="(11) 3000-0000" className="rounded-2xl h-12" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Endereco</Label>
                    <Input value={form.company_address} onChange={(e) => setForm((p) => ({ ...p, company_address: e.target.value }))} placeholder="Av. Paulista, 1000" className="rounded-2xl h-12" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Perfil
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </LojistaAppShell>
  );
};

export default Perfil;
