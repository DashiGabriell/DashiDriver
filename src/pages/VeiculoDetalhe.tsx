// @ts-nocheck
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useNavigate, useParams } from "react-router-dom";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Car,
  Wrench,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Shield,
  Loader2,
  ImageOff,
  Calendar,
  ClipboardCheck,
  Plus,
  FileText,
  Download,
  Upload,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVehicleKm } from "@/hooks/useVehicleKm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const PIE_COLORS = ["#FFBD4C", "#F16A69", "#4ADE80", "#FB923C", "#FF6B6B"];

const tipoColor: Record<string, string> = {
  preventiva: "#4ADE80",
  corretiva: "#FFBD4C",
  emergencial: "#FF6B6B",
};

const statusStyle: Record<string, string> = {
  disponivel: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  alugado: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  oficina: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  bloqueado: "bg-red-500/10 text-red-500 border border-red-500/20",
};

const statusLabel: Record<string, string> = {
  disponivel: "Disponível",
  alugado: "Alugado",
  oficina: "Na oficina",
  bloqueado: "Bloqueado",
};

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// Chave para localStorage
const STORAGE_KEY = "veiculoDetalhe_periodo";

// Função para obter período padrão (mês atual)
function getPeriodoPadrao(): { inicio: Date; fim: Date } {
  const hoje = new Date();
  return {
    inicio: startOfMonth(hoje),
    fim: endOfMonth(hoje),
  };
}

// Função para carregar período do localStorage
function carregarPeriodoSalvo(): { inicio: Date; fim: Date } | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { inicio, fim } = JSON.parse(saved);
      return {
        inicio: new Date(inicio),
        fim: new Date(fim),
      };
    }
  } catch (error) {

  }
  return null;
}

// Função para salvar período no localStorage
function salvarPeriodo(inicio: Date, fim: Date) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      })
    );
  } catch (error) {

  }
}

export default function VeiculoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);
  
  // Estado do período selecionado
  const [periodo, setPeriodo] = useState<{ inicio: Date; fim: Date }>(() => {
    return carregarPeriodoSalvo() || getPeriodoPadrao();
  });

  // Estados do documento
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [isChangingDoc, setIsChangingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar localStorage quando período mudar
  useEffect(() => {
    salvarPeriodo(periodo.inicio, periodo.fim);
  }, [periodo]);

  const { data: vehicleArr, loading: loadingVehicle } = useRealtimeData(
    "carcontrol_vehicles",
    { filter: (q) => q.eq("id", id!) }
  );

  const { data: payments, loading: loadingPayments } = useRealtimeData(
    "carcontrol_payments",
    {
      filter: (q) => q.eq("vehicle_id", id!),
      order: { column: "data", ascending: true },
    }
  );

  const { data: maintenances, loading: loadingMaintenances } = useRealtimeData(
    "carcontrol_maintenances",
    {
      filter: (q) => q.eq("vehicle_id", id!),
      order: { column: "data", ascending: false },
    }
  );

  const { data: drivers } = useRealtimeData("carcontrol_drivers", {
    filter: (q) => q.eq("veiculo_id", id!),
  });

  const { data: checklists } = useRealtimeData("carcontrol_checklists", {
    filter: (q) => q.eq("vehicle_id", id!),
    order: { column: "created_at", ascending: false },
    limit: 5,
  });

  const vehicle = vehicleArr[0] ?? null;
  const { history: kmHistory, stats: kmStats, isLoadingHistory } = useVehicleKm(vehicle?.id);
  const photos = vehicle?.photo_urls ?? [];
  const loading = loadingVehicle || loadingPayments || loadingMaintenances;

  // Group payments by month for the line chart (filtrado pelo período)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) {
      const d = new Date(p.data + "T00:00:00");
      // Filtrar pelo período selecionado
      if (d >= periodo.inicio && d <= periodo.fim) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map.set(key, (map.get(key) ?? 0) + p.valor);
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, valor]) => {
        const [year, month] = key.split("-");
        return {
          mes: `${MONTHS[parseInt(month) - 1]}/${year.slice(2)}`,
          valor,
        };
      });
  }, [payments, periodo]);

  // Group maintenances by type for the pie chart (filtrado pelo período)
  const maintenanceByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of maintenances) {
      const d = new Date(m.data + "T00:00:00");
      // Filtrar pelo período selecionado
      if (d >= periodo.inicio && d <= periodo.fim) {
        map.set(m.tipo, (map.get(m.tipo) ?? 0) + m.valor);
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [maintenances, periodo]);

  // â”€â”€ Cálculos de KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Receita total do período selecionado
  const receitaPeriodo = useMemo(() => {
    return payments
      .filter((p) => {
        const dataPagamento = new Date(p.data + "T00:00:00");
        return dataPagamento >= periodo.inicio && dataPagamento <= periodo.fim;
      })
      .reduce((total, p) => total + (p.valor || 0), 0);
  }, [payments, periodo]);

  // Custos do período selecionado (financiamento + seguro + manutenções)
  const custosPeriodo = useMemo(() => {
    if (!vehicle) return 0;
    
    // Calcular número de meses no período
    const mesesNoPeriodo = Math.ceil(
      (periodo.fim.getTime() - periodo.inicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    // Custos fixos mensais Ã— meses
    const custoFinanciamento = (vehicle.parcela || 0) * mesesNoPeriodo;
    const custoSeguro = (vehicle.seguro || 0) * mesesNoPeriodo;
    
    // Custos de manutenção do período
    const custoManutencaoPeriodo = maintenances
      .filter((m) => {
        const dataManutencao = new Date(m.data + "T00:00:00");
        return dataManutencao >= periodo.inicio && dataManutencao <= periodo.fim;
      })
      .reduce((total, m) => total + (m.valor || 0), 0);
    
    return custoFinanciamento + custoSeguro + custoManutencaoPeriodo;
  }, [vehicle, maintenances, periodo]);

  // Lucro do período = Receita do período - Custos do período
  const lucroPeriodo = receitaPeriodo - custosPeriodo;

  // Totais do período selecionado
  const totalReceita = useMemo(() => {
    return payments
      .filter((p) => {
        const d = new Date(p.data + "T00:00:00");
        return d >= periodo.inicio && d <= periodo.fim;
      })
      .reduce((s, p) => s + p.valor, 0);
  }, [payments, periodo]);

  const totalManutencao = useMemo(() => {
    return maintenances
      .filter((m) => {
        const d = new Date(m.data + "T00:00:00");
        return d >= periodo.inicio && d <= periodo.fim;
      })
      .reduce((s, m) => s + m.valor, 0);
  }, [maintenances, periodo]);
  
  // Calcular total pago em financiamento no período
  const totalParcelasPagas = useMemo(() => {
    if (!vehicle || !vehicle.parcela) return 0;
    
    // Calcular quantos meses no período
    const mesesNoPeriodo = Math.ceil(
      (periodo.fim.getTime() - periodo.inicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    return vehicle.parcela * Math.max(mesesNoPeriodo, 0);
  }, [vehicle, periodo]);
  
  // Calcular total pago em seguro no período
  const totalSeguroPago = useMemo(() => {
    if (!vehicle || !vehicle.seguro) return 0;
    
    // Calcular quantos meses no período
    const mesesNoPeriodo = Math.ceil(
      (periodo.fim.getTime() - periodo.inicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    return vehicle.seguro * Math.max(mesesNoPeriodo, 0);
  }, [vehicle, periodo]);
  
  // Lucratividade líquida do período: Receita - (Financiamento + Seguro + Manutenção)
  const lucratividadeLiquida = totalReceita - (totalParcelasPagas + totalSeguroPago + totalManutencao);

  const prevPhoto = () =>
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () =>
    setPhotoIndex((i) => (i + 1) % photos.length);

  // â”€â”€ Document Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const VEHICLE_DOCUMENTS_BUCKET = "vehicle-documents";

  const getDocumentStoragePath = (url: string) => {
    try {
      const parsed = new URL(url);
      const prefix = `/storage/v1/object/public/${VEHICLE_DOCUMENTS_BUCKET}/`;
      return parsed.pathname.includes(prefix) ? parsed.pathname.replace(prefix, "") : "";
    } catch {
      return "";
    }
  };

  const handleDocumentReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O documento deve ter no máximo 5MB.");
      return;
    }

    setIsChangingDoc(true);
    try {
      if (vehicle?.documento_url) {
        const oldPath = getDocumentStoragePath(vehicle.documento_url);
        if (oldPath) {
          await supabase.storage.from(VEHICLE_DOCUMENTS_BUCKET).remove([oldPath]);
        }
      }
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `${vehicle!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(VEHICLE_DOCUMENTS_BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(VEHICLE_DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("carcontrol_vehicles")
        .update({ documento_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", vehicle!.id);

      if (updateError) throw updateError;

      toast.success("Documento atualizado com sucesso!");
      setDocModalOpen(false);
    } catch (err: any) {
      toast.error("Erro ao alterar documento: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsChangingDoc(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!vehicle) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">Veículo não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/veiculos")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </AppShell>
    );
  }

  const sStyle = statusStyle[vehicle.status] ?? "bg-muted/20 text-muted-foreground border border-border/50";
  const sLabel = statusLabel[vehicle.status] ?? vehicle.status;

  return (
    <AppShell>
      <Topbar
        title={`${vehicle.modelo} '${String(vehicle.ano).slice(2)}`}
        subtitle={`${vehicle.placa} · ${vehicle.marca}`}
        helpPath="/ajuda/gestao/veiculos"
      />

      {/* Back + Status */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/veiculos")}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para veículos
        </Button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sStyle}`}>
          {sLabel}
        </span>
      </div>

      {/* â”€â”€ Seletor de Período â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-4 mb-6 animate-blur-in">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Período de Análise:
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Data Início */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(periodo.inicio, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={periodo.inicio}
                  onSelect={(date) => {
                    if (date) {
                      setPeriodo((prev) => ({ ...prev, inicio: date }));
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">até</span>

            {/* Data Fim */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(periodo.fim, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={periodo.fim}
                  onSelect={(date) => {
                    if (date) {
                      setPeriodo((prev) => ({ ...prev, fim: date }));
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Botão Mês Atual */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPeriodo(getPeriodoPadrao())}
              className="text-xs"
            >
              Mês Atual
            </Button>
          </div>

          {/* Indicador de período */}
          <div className="ml-auto text-xs text-muted-foreground">
            {Math.ceil(
              (periodo.fim.getTime() - periodo.inicio.getTime()) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            dias
          </div>
        </div>
      </div>

      {/* â”€â”€ Photo Slideshow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {photos.length > 0 ? (
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-muted/30 h-64 md:h-[22rem]">
          <img
            key={photoIndex}
            src={photos[photoIndex]}
            alt={`Foto ${photoIndex + 1} de ${vehicle.modelo}`}
            className="w-full h-full object-cover animate-blur-in"
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    aria-label={`Ir para foto ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === photoIndex
                        ? "bg-primary scale-125 shadow-sm"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Counter badge */}
              <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {photoIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mb-8 flex items-center justify-center h-36 rounded-3xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground gap-2">
          <ImageOff className="w-5 h-5" />
          <span className="text-sm">Sem fotos cadastradas</span>
        </div>
      )}

      {/* â”€â”€ KPI Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="neu p-5 animate-blur-in">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Lucro / período
          </div>
          <div
            className={`font-display text-xl font-bold ${
              lucroPeriodo >= 0 ? "text-foreground" : "text-danger"
            }`}
          >
            {fmtBRL(lucroPeriodo)}
          </div>
          {lucroPeriodo >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500 mt-2" />
          ) : (
            <TrendingDown className="w-4 h-4 text-danger mt-2" />
          )}
        </div>

        <div className="neu p-5 animate-blur-in delay-75">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Receita / período
          </div>
          <div className="font-display text-xl font-bold text-primary">
            {fmtBRL(receitaPeriodo)}
          </div>
          <DollarSign className="w-4 h-4 text-primary mt-2" />
        </div>

        <div className="neu p-5 animate-blur-in delay-150">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            KM atual
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {vehicle.km_atual?.toLocaleString("pt-BR") || "0"}
          </div>
          <Car className="w-4 h-4 text-muted-foreground mt-2" />
        </div>

        <div className="neu p-5 animate-blur-in delay-300">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Parcelas rest.
          </div>
          <div className="font-display text-xl font-bold text-foreground">
            {vehicle.parcelas_restantes && vehicle.parcelas_restantes > 0 
              ? vehicle.parcelas_restantes 
              : "Quitado"}
          </div>
          <CreditCard className="w-4 h-4 text-muted-foreground mt-2" />
        </div>
      </div>

      {/* â”€â”€ Financiamento Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Informações de Financiamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neu-inset p-4 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Valor da Parcela
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {fmtBRL(vehicle.parcela || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Vencimento: {vehicle.vencimento_parcela ? fmtDate(vehicle.vencimento_parcela) : "Não definido"}
            </div>
          </div>

          <div className="neu-inset p-4 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Banco Financiador
            </div>
            <div className="font-display text-lg font-bold text-foreground">
              {vehicle.banco || "Não informado"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Instituição financeira
            </div>
          </div>

          <div className="neu-inset p-4 rounded-xl">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Total a Pagar
            </div>
            <div className="font-display text-2xl font-bold text-amber-600">
              {vehicle.parcelas_restantes && vehicle.parcelas_restantes > 0
                ? fmtBRL((vehicle.parcela || 0) * vehicle.parcelas_restantes)
                : fmtBRL(0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {vehicle.parcelas_restantes && vehicle.parcelas_restantes > 0
                ? `${vehicle.parcelas_restantes} parcelas restantes`
                : "Veículo quitado"}
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Vehicle Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <Car className="w-4 h-4" /> Informações do Veículo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 text-sm">
          {[
            { label: "Marca", value: vehicle.marca },
            { label: "Modelo", value: vehicle.modelo },
            { label: "Ano", value: vehicle.ano },
            { label: "Cor", value: vehicle.cor },
            { label: "Placa", value: vehicle.placa, mono: true },
            { label: "KM inicial", value: vehicle.km_inicial.toLocaleString("pt-BR") },
            { label: "Banco", value: vehicle.banco },
            { label: "Parcela", value: fmtBRL(vehicle.parcela) },
            { label: "Venc. parcela", value: vehicle.vencimento_parcela ? fmtDate(vehicle.vencimento_parcela) : "â€”" },
            { label: "Seguro", value: fmtBRL(vehicle.seguro) },
            { label: "Venc. seguro", value: vehicle.vencimento_seguro ? fmtDate(vehicle.vencimento_seguro) : "â€”" },
            { label: "Custo / mês", value: fmtBRL(vehicle.custo_mes) },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
              <div className={`font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controle de Quilometragem ── */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" /> Controle de Quilometragem
        </h2>

        {kmStats.kmTotal > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="neu-inset p-4 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                KM Atual
              </div>
              <div className="font-display text-2xl font-bold text-foreground">
                {kmStats.kmTotal.toLocaleString("pt-BR")} km
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Última atualização: {kmStats.ultimaAtualizacao ? fmtDate(kmStats.ultimaAtualizacao) : "—"}
              </div>
            </div>
            <div className="neu-inset p-4 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Rodado (30 dias)
              </div>
              <div className="font-display text-2xl font-bold text-primary">
                +{kmStats.km30dias.toLocaleString("pt-BR")} km
              </div>
            </div>
            <div className="neu-inset p-4 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Média Diária
              </div>
              <div className="font-display text-2xl font-bold text-foreground">
                {kmStats.mediaDiaria} km/dia
              </div>
            </div>
          </div>
        )}

        {!kmStats.kmTotal && !isLoadingHistory && (
          <div className="flex items-center justify-center h-20 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground gap-2">
            <Gauge className="w-5 h-5" />
            <span className="text-sm">Nenhum registro de KM ainda. Complete um checklist para começar.</span>
          </div>
        )}

        {isLoadingHistory && (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {kmHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2 font-medium">Data</th>
                  <th className="text-left py-2 font-medium">KM</th>
                  <th className="text-left py-2 font-medium">Origem</th>
                  {kmHistory.some((h: any) => h.observation) && (
                    <th className="text-left py-2 font-medium">Obs</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {kmHistory.slice(0, 10).map((h: any) => (
                  <tr key={h.id} className="border-b border-border/40">
                    <td className="py-2 text-muted-foreground">{fmtDate(h.created_at)}</td>
                    <td className="py-2 font-mono">{h.km.toLocaleString("pt-BR")} km</td>
                    <td className="py-2">
                      {h.source === 'checklist' ? 'Checklist' :
                       h.source === 'maintenance' ? 'Manutenção' :
                       h.source === 'manual_edit' ? 'Edição manual' : h.source}
                    </td>
                    {kmHistory.some((x: any) => x.observation) && (
                      <td className="py-2 text-xs text-muted-foreground">{h.observation || "—"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Documento do Veículo ── */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <h2 className="font-display text-base font-bold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Documento do Veículo
        </h2>
        {vehicle?.documento_url ? (
          <button
            onClick={() => setDocModalOpen(true)}
            className="neu group p-5 text-left hover:neu-interactive transition-all duration-300 cursor-pointer rounded-2xl w-full border border-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">Documento do Veículo</div>
                <div className="text-xs mt-1 text-muted-foreground">Clique para visualizar</div>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-center h-20 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm">Nenhum documento anexado</span>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line chart - monthly revenue */}
        <div className="neu p-6 animate-blur-in">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Faturamento no Período
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            Receita registrada no período selecionado
          </p>
          {monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
              Nenhum pagamento registrado no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [fmtBRL(value), "Receita"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart â€“ maintenance by type */}
        <div className="neu p-6 animate-blur-in delay-75">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Manutenção no Período
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            Distribuição dos custos no período selecionado
          </p>
          {maintenanceByType.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
              Nenhuma manutenção registrada no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={maintenanceByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {maintenanceByType.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={tipoColor[entry.name] ?? PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [fmtBRL(value), "Custo"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* â”€â”€ Summary Totals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="neu p-5 animate-blur-in">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Total recebido (período)
          </div>
          <div className="font-display text-2xl font-bold text-primary">
            {fmtBRL(totalReceita)}
          </div>
        </div>
        <div className="neu p-5 animate-blur-in delay-75">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Total financiamento (período)
          </div>
          <div className="font-display text-2xl font-bold text-blue-600">
            {fmtBRL(totalParcelasPagas)}
          </div>
        </div>
        <div className="neu p-5 animate-blur-in delay-150">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Total manutenção (período)
          </div>
          <div className="font-display text-2xl font-bold" style={{ color: "#f59e0b" }}>
            {fmtBRL(totalManutencao)}
          </div>
        </div>
        <div className="neu p-5 animate-blur-in delay-300">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Lucratividade líquida
          </div>
          <div
            className={`font-display text-2xl font-bold ${
              lucratividadeLiquida >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {fmtBRL(lucratividadeLiquida)}
          </div>
        </div>
      </div>

      {/* â”€â”€ Payment History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-6 mb-8 animate-blur-in overflow-x-auto">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Recebimento de Alugueis
        </h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum pagamento registrado.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[28rem]">
            <thead>
              <tr className="border-b border-border/60 text-left">
                {["Data", "Valor", "Método", "Status"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...payments].reverse().map((p) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs">{fmtDate(p.data)}</td>
                  <td className="py-3 font-semibold">{fmtBRL(p.valor)}</td>
                  <td className="py-3 text-muted-foreground capitalize">{p.metodo}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "pago"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "pendente"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* â”€â”€ Maintenance History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-6 mb-8 animate-blur-in overflow-x-auto">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Histórico de Manutenção
        </h2>
        {maintenances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma manutenção registrada.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[36rem]">
            <thead>
              <tr className="border-b border-border/60 text-left">
                {["Data", "Serviço", "Tipo", "Oficina", "Valor"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => (
                <tr key={m.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs">{fmtDate(m.data)}</td>
                  <td className="py-3">{m.servico}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.tipo === "preventiva"
                          ? "bg-emerald-100 text-emerald-700"
                          : m.tipo === "corretiva"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{m.oficina}</td>
                  <td className="py-3 font-semibold">{fmtBRL(m.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* â”€â”€ Checklist History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="neu p-6 mb-8 animate-blur-in overflow-x-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Histórico de Checklists
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1"
            onClick={() => navigate("/mobile/checklists/novo")}
          >
            <Plus className="w-3 h-3" /> Novo Checklist
          </Button>
        </div>
        {checklists.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma vistoria realizada ainda.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[28rem]">
            <thead>
              <tr className="border-b border-border/60 text-left">
                {["Data", "Tipo", "Status", "Ações"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checklists.map((c) => (
                <tr key={c.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs">{fmtDate(c.created_at)}</td>
                  <td className="py-3 capitalize">{c.type.replace("_", " ")}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                        c.status === "finalizado"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => navigate(`/mobile/checklists/${c.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* â”€â”€ Linked Drivers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {drivers.length > 0 && (
        <div className="neu p-6 mb-8 animate-blur-in">
          <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Motoristas Vinculados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="neu-inset p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {d.nome.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{d.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {d.telefone} · CNH: {d.cnh}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "ativo"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* â”€â”€ Modal de Visualização do Documento â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Documento â€” {vehicle?.modelo} ({vehicle?.placa})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 w-full min-h-0 rounded-lg overflow-hidden border">
            <iframe
              src={vehicle?.documento_url}
              className="w-full h-full"
              title="Documento do Veículo"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              onClick={() => window.open(vehicle?.documento_url, "_blank")}
            >
              <Download className="w-4 h-4 mr-2" /> Baixar
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isChangingDoc}>
              {isChangingDoc ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Alterar Documento
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleDocumentReplace}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
