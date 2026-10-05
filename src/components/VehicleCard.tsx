import { useCountAnimation } from "@/hooks/useCountAnimation";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Vehicle = Tables<"carcontrol_vehicles">;
type Schedule = Tables<"carcontrol_parcela_seguro_schedules">;

export type VehicleCardProps = {
  vehicle: Vehicle;
  delay?: string;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

const statusMap: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "text-success" },
  alugado: { label: "Alugado", cls: "text-foreground" },
  oficina: { label: "Na oficina", cls: "text-warning" },
  bloqueado: { label: "Bloqueado", cls: "text-danger" },
};

// Helper: Obter intervalo do mês atual
const getMonthInterval = () => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return { inicio, fim };
};

export const VehicleCard = ({ vehicle, delay = "", onEdit, onDelete }: VehicleCardProps) => {
  const navigate = useNavigate();
  const [parcelasRestantes, setParcelasRestantes] = useState(vehicle.parcelas_restantes);
  const [valorParcela, setValorParcela] = useState(vehicle.parcela);
  const [valorSeguro, setValorSeguro] = useState(vehicle.seguro);
  const [receita, setReceita] = useState(0);
  const [manutencoes, setManutencoes] = useState(0);
  
  // Buscar informações atualizadas das programações, receitas e manutenções
  useEffect(() => {
    const fetchData = async () => {
      if (!vehicle.id) return;
      
      try {
        const { inicio, fim } = getMonthInterval();
        
        // 1. Buscar programações de parcela e seguro
        const { data: schedules, error: schedError } = await supabase
          .from("carcontrol_parcela_seguro_schedules")
          .select("*")
          .eq("vehicle_id", vehicle.id)
          .eq("ativo", true);

        if (schedError) throw schedError;
        
        if (schedules && schedules.length > 0) {
          const parcelaSchedule = schedules.find(s => s.tipo === "parcela");
          const seguroSchedule = schedules.find(s => s.tipo === "seguro");
          
          if (parcelaSchedule) {
            setValorParcela(parcelaSchedule.valor || vehicle.parcela);
            
            // Calcular parcelas restantes baseado em data_fim
            if (parcelaSchedule.data_fim) {
              const hoje = new Date();
              const dataFim = new Date(parcelaSchedule.data_fim);
              const mesesRestantes = Math.max(0, Math.ceil(
                (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 30)
              ));
              setParcelasRestantes(mesesRestantes);
            }
          }
          
          if (seguroSchedule) {
            setValorSeguro(seguroSchedule.valor || vehicle.seguro);
          }
        }
        
        // 2. Buscar receitas confirmadas (pagamentos com driver_id) no mês
        const { data: payments, error: payError } = await supabase
          .from("carcontrol_payments")
          .select("valor")
          .eq("vehicle_id", vehicle.id)
          .eq("status", "pago")
          .not("driver_id", "is", null)
          .gte("data", inicio.toISOString().split('T')[0])
          .lte("data", fim.toISOString().split('T')[0]);

        if (payError) throw payError;
        
        const totalReceita = payments?.reduce((sum, p) => sum + (Number(p.valor) || 0), 0) || 0;
        setReceita(totalReceita);
        
        // 3. Buscar manutenções do veículo no mês
        const { data: manutencoesData, error: maintError } = await supabase
          .from("carcontrol_maintenances")
          .select("valor")
          .eq("vehicle_id", vehicle.id)
          .gte("data", inicio.toISOString().split('T')[0])
          .lte("data", fim.toISOString().split('T')[0]);

        if (maintError) throw maintError;
        
        const totalManutencoes = manutencoesData?.reduce((sum, m) => sum + (Number(m.valor) || 0), 0) || 0;
        setManutencoes(totalManutencoes);
        
      } catch (error) {

      }
    };
    
    fetchData();
  }, [vehicle.id]);
  
  // Calcular lucro real: Receita - (Parcela + Seguro + Manutenções)
  const despesasTotal = valorParcela + valorSeguro + manutencoes;
  const lucro = receita - despesasTotal;
  
  const status = statusMap[vehicle.status] || { label: vehicle.status, cls: "text-muted-foreground" };
  const delaySeconds = delay.includes("delay-75") ? 0.075 : delay.includes("delay-150") ? 0.15 : delay.includes("delay-300") ? 0.3 : 0;
  const kmRef = useCountAnimation(vehicle.km_atual, 2, delaySeconds);
  const parcelasRef = useCountAnimation(parcelasRestantes, 2, delaySeconds);
  const lucroRef = useCountAnimation(lucro, 2, delaySeconds, true);

  return (
    <div
      className={`neu p-4 md:p-5 flex flex-col gap-3 md:gap-4 animate-blur-in ${delay} transition-all duration-300 hover:neu-interactive cursor-pointer`}
      onClick={() => navigate(`/veiculos/${vehicle.id}`)}
    >
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
            {vehicle.marca}
          </div>
          <h3 className="font-display text-lg md:text-xl font-bold leading-tight truncate">
            {vehicle.modelo} <span className="text-muted-foreground font-medium">'{String(vehicle.ano).slice(2)}</span>
          </h3>
        </div>
        <span className={`chip text-[10px] md:text-xs ${status.cls} shrink-0`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      {vehicle.photo_urls && vehicle.photo_urls.length > 0 ? (
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-border/60">
          <img
            src={vehicle.photo_urls[0]}
            alt={`Foto do veículo ${vehicle.modelo}`}
            className="h-36 md:h-44 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="neu-inset px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
        <span className="font-mono text-xs md:text-sm font-semibold tracking-wider">{vehicle.placa}</span>
        <span className="text-[10px] md:text-xs text-muted-foreground">{vehicle.cor}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
          <img src="/assets/velocimetro.png" alt="Velocímetro" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain shrink-0" />
          <span className="truncate"><span ref={kmRef}>0</span> km</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
          <img src="/assets/data-parcela.png" alt="Data de parcela" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain shrink-0" />
          <span className="truncate">{parcelasRestantes > 0 ? <><span ref={parcelasRef}>0</span> parc.</> : "Quitado"}</span>
        </div>
      </div>

      <div className="border-t border-border/60 pt-3 md:pt-4 flex flex-col gap-3 md:gap-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground">Lucro mês</div>
            <div className={`font-display text-lg md:text-xl font-bold ${lucro >= 0 ? "text-foreground" : "text-danger"}`}>
              R$ <span ref={lucroRef}>0</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground">Despesas</div>
            <div className="text-xs md:text-sm font-semibold text-danger">
              R$ {despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onEdit?.(vehicle); }}
            className="touch-target text-xs"
          >
            <Edit3 className="w-3 h-3" /> <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(vehicle); }}
            className="touch-target text-xs"
          >
            <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
