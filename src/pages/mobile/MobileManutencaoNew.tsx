import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mobileManutencaoSchema, MobileManutencaoInput } from "@/lib/validators/mobile-manutencao";
import { kmHistoryService } from "@/integrations/supabase/services/kmHistoryService";
import { maintenanceService } from "@/integrations/supabase/services/maintenanceService";
import { vehicleService } from "@/integrations/supabase/services/vehicleService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";

const MobileManutencaoNew = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [veiculos, setVeiculos] = useState<{ id: string; modelo: string | null; placa: string | null }[]>([]);

  const [formData, setFormData] = useState({
    vehicle_id: "",
    servico: "",
    tipo: "preventiva" as "preventiva" | "corretiva" | "emergencial",
    data: new Date().toISOString().split("T")[0],
    valor: "",
    km_atual: "",
    oficina: "",
    observacoes: "",
  });
  const form = useForm<MobileManutencaoInput>({
    resolver: zodResolver(mobileManutencaoSchema),
    values: {
      vehicle_id: formData.vehicle_id,
      servico: formData.servico,
      data: formData.data,
      oficina: formData.oficina,
      observacao: formData.observacoes,
    },
  });

  useEffect(() => {
    let cancelled = false;
    vehicleService
      .listOptions()
      .then((data) => {
        if (!cancelled) setVeiculos(data);
      })
      .catch(() => {
        if (!cancelled) setVeiculos([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await maintenanceService.create({
        vehicle_id: formData.vehicle_id,
        servico: formData.servico,
        tipo: formData.tipo,
        data: formData.data,
        valor: formData.valor ? Number(formData.valor) : 0,
        km_atual: formData.km_atual ? Number(formData.km_atual) : null,
        oficina: formData.oficina,
        observacoes: formData.observacoes || null,
        user_id: session?.user?.id,
      });

      if (formData.km_atual && company?.id) {
        await kmHistoryService.record({
          company_id: company.id,
          vehicle_id: formData.vehicle_id,
          km: Number(formData.km_atual),
          source: "maintenance",
          userId: session?.user?.id,
        });
        await kmHistoryService.updateVehicleKm(formData.vehicle_id, Number(formData.km_atual));
      }

      toast.success("Manutenção registrada!");
      navigate("/mobile/manutencao");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao salvar manutenção"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent/10 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Nova Manutenção</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        <div className="space-y-2">
          <Label>Veículo</Label>
          <Select value={formData.vehicle_id} onValueChange={(v) => setFormData((f) => ({ ...f, vehicle_id: v }))}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione o veículo" />
            </SelectTrigger>
            <SelectContent>
              {veiculos.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.modelo} ({v.placa})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Serviço</Label>
          <Input
            required
            className="bg-white"
            value={formData.servico}
            onChange={(e) => setFormData((f) => ({ ...f, servico: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={formData.tipo}
            onValueChange={(v: "preventiva" | "corretiva" | "emergencial") =>
              setFormData((f) => ({ ...f, tipo: v }))
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventiva">Preventiva</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
              <SelectItem value="emergencial">Emergencial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              className="bg-white"
              required
              value={formData.data}
              onChange={(e) => setFormData((f) => ({ ...f, data: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              className="bg-white"
              value={formData.valor}
              onChange={(e) => setFormData((f) => ({ ...f, valor: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Oficina</Label>
          <Input
            className="bg-white"
            value={formData.oficina}
            onChange={(e) => setFormData((f) => ({ ...f, oficina: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            className="bg-white"
            value={formData.observacoes}
            onChange={(e) => setFormData((f) => ({ ...f, observacoes: e.target.value }))}
          />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Manutenção
        </Button>
      </form>
    </div>
  );
};

export default MobileManutencaoNew;

