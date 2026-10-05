import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MarketplaceBottomNav from "@/components/marketplace/MarketplaceBottomNav";
import { motion } from "framer-motion";
import { Camera, Car, Sparkles, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CityAutocomplete } from "@/components/marketplace/CityAutocomplete";
import { createMarketplaceListing, checkPlanLimit } from "@/integrations/supabase/services/marketplaceService";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";
import { useCompany } from "@/hooks/useCompany";
import { marcas } from "@/data/marcasModelos";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { marketplaceSellSchema, MarketplaceSellInput } from "@/lib/validators/marketplace-sell";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const MarketplaceSell = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [caucao, setCaucao] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [cambio, setCambio] = useState<"manual" | "automatico">("manual");
  const [arCondicionado, setArCondicionado] = useState(false);
  const [garagem, setGaragem] = useState(false);
  const [direcao, setDirecao] = useState<"hidraulica" | "eletrica" | "mecanica">("eletrica");
  const [combustivel, setCombustivel] = useState<"flex" | "gasolina" | "etanol" | "diesel" | "hibrido" | "eletrico">("flex");
  const [categoryId, setCategoryId] = useState("");
  const [tempoPlataforma, setTempoPlataforma] = useState<"1+" | "3+" | "5+">("1+");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const form = useForm<MarketplaceSellInput>({
    resolver: zodResolver(marketplaceSellSchema),
    values: {
      title,
      marca,
      modelo,
      price: price ? Number(price.replace(",", ".")) : 0,
      categoryId,
      cidade,
      estado,
      ano,
      quilometragem: "",
      description,
    },
  });
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: company } = useCompany();
  const CATEGORIAS = ["Uberx/99pop", "Comfort", "Black/Executivo", "Utilitário"];

  const createMutation = useMutation({
    mutationFn: async () => {
      const isValid = await form.trigger();
      if (!isValid) throw new Error("Verifique os campos obrigatórios.");

      if (!company) {
        throw new Error("Escolha um plano Marketplace antes de publicar anúncios.");
      }

      const planCheck = await checkPlanLimit(company.id);
      if (!planCheck.allowed) {
        throw new Error(`Seu plano ${planCheck.plan} permite até ${planCheck.limit} anúncio(s) ativo(s). Você já tem ${planCheck.current}.`);
      }
      
      const parsedCaucao = Number(caucao.replace(",", "."));
      const parsedPrice = Number(price.replace(",", "."));

      return createMarketplaceListing({
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        period: "semana",
        categoryId: "cars",
        condition: "Disponível",
        files,
        companyId: company.id,
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        cambio,
        ar_condicionado: arCondicionado,
        direcao,
        combustivel,
        valor_caucao: parsedCaucao,
        garagem,
        tempo_plataforma: tempoPlataforma,
        city: cidade.trim(),
        state: estado,
      });
    },
    onSuccess: (id) => {
      toast.success("Anúncio publicado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
      navigate(`/marketplace/detail/${id}`);
    },
    onError: (error: any) => toast.error(error.message || "Erro ao publicar anúncio."),
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="px-4 pt-6 space-y-8">
        <header className="space-y-2 px-1">
          <h1 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
            Cadastrar <span className="text-primary italic">Veículo</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Preencha os dados técnicos do veículo para locação.
          </p>
        </header>

        <section className="p-6 rounded-[3rem] bg-card border border-white/5 shadow-neu-sm space-y-5">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 rounded-2xl bg-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Título do Anúncio</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Fiat Cronos 2024 para App" className="h-12 rounded-2xl bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-12 rounded-2xl bg-white">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[100]">
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <CityAutocomplete
                value={cidade}
                onChange={setCidade}
                state={estado}
                placeholder="Ex: São Paulo"
                className="h-12 rounded-2xl bg-white w-full px-4 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={marca} onValueChange={(v) => { setMarca(v); setModelo("") }}>
                <SelectTrigger className="h-12 rounded-2xl bg-white">
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((m) => (
                    <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={modelo} onValueChange={setModelo} disabled={!marca}>
                <SelectTrigger className="h-12 rounded-2xl bg-white">
                  <SelectValue placeholder={marca ? "Selecione o modelo" : "Escolha a marca primeiro"} />
                </SelectTrigger>
                <SelectContent className="bg-white z-[100]">
                  {marcas.find((m) => m.nome === marca)?.modelos.map((mod) => (
                    <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input type="number" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="Ex: 2024" className="h-12 rounded-2xl bg-white" />
            </div>
            <div className="space-y-2">
              <Label>Câmbio</Label>
              <Select value={cambio} onValueChange={(v: any) => setCambio(v)}>
                <SelectTrigger className="h-12 rounded-2xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatico">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor Semanal (R$)</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 650" className="h-12 rounded-2xl bg-white" />
            </div>
            <div className="space-y-2">
              <Label>Caução (R$)</Label>
              <Input value={caucao} onChange={(e) => setCaucao(e.target.value)} placeholder="Ex: 500" className="h-12 rounded-2xl bg-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Combustível</Label>
            <Select value={combustivel} onValueChange={(v: any) => setCombustivel(v)}>
              <SelectTrigger className="h-12 rounded-2xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="etanol">Etanol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
                <SelectItem value="eletrico">Elétrico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
            <Label htmlFor="ar-condicionado">Ar Condicionado</Label>
            <Switch id="ar-condicionado" checked={arCondicionado} onCheckedChange={setArCondicionado} />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
            <Label htmlFor="garagem">Necessário Garagem</Label>
            <Switch id="garagem" checked={garagem} onCheckedChange={setGaragem} />
          </div>

          <div className="space-y-2">
            <Label>Tempo na Plataforma (Uber/99/Indrive)</Label>
            <Select value={tempoPlataforma} onValueChange={(v: any) => setTempoPlataforma(v)}>
              <SelectTrigger className="h-12 rounded-2xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1+">1+ ano</SelectItem>
                <SelectItem value="3+">3+ anos</SelectItem>
                <SelectItem value="5+">5+ anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Direção</Label>
            <Select value={direcao} onValueChange={(v: any) => setDirecao(v)}>
              <SelectTrigger className="h-12 rounded-2xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                <SelectItem value="eletrica">Elétrica</SelectItem>
                <SelectItem value="mecanica">Mecânica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais..." className="min-h-28 rounded-2xl bg-white" />
          </div>
        </section>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="p-8 rounded-[3rem] bg-muted/30 border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-inner">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter leading-none">Fotos do Veículo</h3>
              <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">{files.length} imagem(ns)</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="aspect-square rounded-2xl bg-background/50 border border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                {files[index] ? <img src={URL.createObjectURL(files[index])} alt="" className="w-full h-full object-cover" /> : <PlusCircle className="w-5 h-5 text-muted-foreground/30" />}
              </div>
            ))}
          </div>

          <label className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground flex items-center justify-center cursor-pointer">
            Adicionar Imagens
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
          </label>
        </motion.div>

        <div className="flex gap-4 p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10">
          <img src="/assets/cabeca.png" alt="Cabeca" className="w-6 h-6 shrink-0" />
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">Dados completos atraem motoristas mais qualificados.</p>
        </div>

        <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()} className="w-full h-16 rounded-[2rem] text-xs font-black uppercase tracking-widest">
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Anúncio"}
        </Button>
      </main>

      <MarketplaceBottomNav />
    </div>
  );
};

export default MarketplaceSell;
