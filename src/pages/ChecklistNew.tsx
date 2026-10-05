import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checklistFormSchema, type ChecklistFormData } from "@/lib/validators/checklist-form";

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
}

interface Driver {
  id: string;
  nome: string;
}

export default function ChecklistNew() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistFormSchema),
    defaultValues: {
      type: "entrega",
    },
  });

  // Buscar veículos
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("id, placa, modelo")
        .order("modelo");

      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });

  // Buscar motoristas
  const { data: drivers = [], isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_drivers")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");

      if (error) throw error;
      return (data || []) as Driver[];
    },
  });

  // Mutation para criar checklist
  const createMutation = useMutation({
    mutationFn: async (formData: ChecklistFormData) => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // Obter company_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.company_id) {
        throw new Error("Empresa não encontrada para o usuário");
      }

      const { data, error } = await supabase
        .from("carcontrol_checklists")
        .insert({
          company_id: profile.company_id,
          vehicle_id: formData.vehicle_id,
          driver_id: formData.driver_id || null,
          type: formData.type,
          notes: formData.notes || null,
          status: "em_andamento",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Checklist criado com sucesso!");
      navigate(`/checklists/${data.id}`);
    },
    onError: (error) => {

      toast.error("Erro ao criar checklist. Tente novamente.");
    },
  });

  const onSubmit = async (formData: ChecklistFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicleId = watch("vehicle_id");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/checklists")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">Novo Checklist</h1>
            <p className="text-muted-foreground mt-1">
              Criar uma nova vistoria de veículo
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Veículo */}
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo *</Label>
                <Select
                  value={selectedVehicleId}
                  onValueChange={(value) => setValue("vehicle_id", value)}
                >
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingVehicles ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Carregando...
                      </div>
                    ) : vehicles.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Nenhum veículo disponível
                      </div>
                    ) : (
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.modelo} - {vehicle.placa}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.vehicle_id && (
                  <p className="text-sm text-red-500">
                    {errors.vehicle_id.message}
                  </p>
                )}
              </div>

              {/* Motorista */}
              <div className="space-y-2">
                <Label htmlFor="driver">Motorista</Label>
                <Select
                  value={watch("driver_id") || ""}
                  onValueChange={(value) => setValue("driver_id", value || undefined)}
                >
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Selecione um motorista (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDrivers ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Carregando...
                      </div>
                    ) : drivers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Nenhum motorista disponível
                      </div>
                    ) : (
                      drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Checklist *</Label>
                <Select
                  defaultValue="entrega"
                  onValueChange={(value) =>
                    setValue("type", value as any)
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="devolucao">Devolução</SelectItem>
                    <SelectItem value="avaria">Avaria</SelectItem>
                    <SelectItem value="pos_manutencao">Manutenção</SelectItem>
                    <SelectItem value="semanal_automatizada">Vistoria Semanal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre o checklist..."
                  {...register("notes")}
                  className="min-h-24"
                />
              </div>

              {/* Resumo */}
              {selectedVehicle && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    Resumo do Checklist
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Veículo:</span>{" "}
                      {selectedVehicle.modelo} ({selectedVehicle.placa})
                    </p>
                    <p>
                      <span className="font-medium">Tipo:</span>{" "}
                      {watch("type")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/checklists")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingVehicles}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Checklist"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
