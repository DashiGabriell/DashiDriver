// @ts-nocheck
import { useState } from "react";
import MobileHeader from "@/layouts/mobile/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Car, User, ClipboardCheck, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChecklist } from "@/hooks/useChecklist";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { ChecklistType } from "@/lib/checklist/constants";
import { toast } from "sonner";

const ChecklistNew = () => {
  const navigate = useNavigate();
  const { profile } = useCarcontrolUser();
  const { create, isCreating } = useChecklist();
  
  const [vehicleId, setVehicleId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [type, setType] = useState<ChecklistType>("entrega");

  // Fetch vehicles
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["veiculos-checklist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("id, placa, modelo")
        .order("placa");
      if (error) throw error;
      return data;
    },
  });

  // Fetch drivers
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["motoristas-checklist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_drivers")
        .select("id, nome")
        .eq("status", "ativo")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const handleStart = async () => {
    if (!vehicleId || !type || !profile) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const newChecklist = await create({
        company_id: profile.company_id,
        user_id: profile.id,
        vehicle_id: vehicleId,
        driver_id: driverId && driverId !== "none" ? driverId : null,
        type: type,
      });

      if (newChecklist) {
        toast.success("Vistoria iniciada!");
        navigate(`/mobile/checklists/${newChecklist.id}`);
      }
    } catch (error) {

    }
  };

  const isLoading = isLoadingVehicles || isLoadingDrivers || isCreating;

  return (
    <div className="animate-fade-in pb-10">
      <MobileHeader />
      
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">Nova Vistoria</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados abaixo para iniciar a captura.</p>
        </div>

        <Card className="neu">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Tipo de Checklist
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as ChecklistType)}>
                <SelectTrigger id="type" className="neu-inset h-12">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">Entrega ao Motorista</SelectItem>
                  <SelectItem value="devolucao">Devolução do Veículo</SelectItem>
                  <SelectItem value="troca_motorista">Troca de Motorista</SelectItem>
                  <SelectItem value="pos_manutencao">Pós Manutenção</SelectItem>
                  <SelectItem value="avaria">Registro de Avaria</SelectItem>
                  <SelectItem value="auditoria">Auditoria de Rotina</SelectItem>
                  <SelectItem value="semanal_automatizada">Vistoria Semanal Automatizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle" className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                <Car className="w-4 h-4 text-primary" />
                Veículo
              </Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger id="vehicle" className="neu-inset h-12">
                  <SelectValue placeholder={isLoadingVehicles ? "Carregando..." : "Selecione o veículo"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} - {v.modelo}
                    </SelectItem>
                  ))}
                  {(!vehicles || vehicles.length === 0) && !isLoadingVehicles && (
                    <SelectItem value="none" disabled>Nenhum veículo disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver" className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                <User className="w-4 h-4 text-primary" />
                Motorista (Opcional)
              </Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger id="driver" className="neu-inset h-12">
                  <SelectValue placeholder={isLoadingDrivers ? "Carregando..." : "Selecione o motorista"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum motorista</SelectItem>
                  {drivers?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Certifique-se de estar em um local bem iluminado. Todas as fotos são processadas com marca d'água para segurança jurídica.
              </p>
            </div>

            <Button 
              className="w-full gap-2 h-14 text-lg font-bold shadow-lg" 
              size="lg" 
              onClick={handleStart}
              disabled={!vehicleId || !type || isLoading}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar Captura
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistNew;
