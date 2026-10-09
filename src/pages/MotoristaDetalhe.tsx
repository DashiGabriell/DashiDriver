import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useNavigate, useParams } from "react-router-dom";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useTheme } from "next-themes";
import { darkChartTheme } from "@/components/charts/ChartTheme";

type Vehicle = Tables<"carcontrol_vehicles">;
type Maintenance = Tables<"carcontrol_maintenances">;
import {
  ArrowLeft,
  Phone,
  IdCard,
  Car,
  Wrench,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  User,
  CalendarDays,
  Banknote,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

const statusStyle: Record<string, string> = {
  ativo: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  atrasado: "bg-red-500/10 text-red-500 border border-red-500/20",
  encerrado: "bg-muted/20 text-muted-foreground border border-border/50",
};

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const tipoColor: Record<string, string> = {
  preventiva: "#10b981",
  corretiva: "#f59e0b",
  emergencial: "#ef4444",
};

export default function MotoristaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data: driverArr, loading: loadingDriver } = useRealtimeData(
    "carcontrol_drivers",
    { filter: (q) => q.eq("id", id!) }
  );

  const { data: payments, loading: loadingPayments } = useRealtimeData(
    "carcontrol_payments",
    {
      filter: (q) => q.eq("driver_id", id!),
      order: { column: "data", ascending: true },
    }
  );

  const driver = driverArr[0] ?? null;

  // Buscar valor semanal da programação de pagamento ativa
  const [valorSemanal, setValorSemanal] = useState<number>(0);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchValorSemanal = async () => {
      const { data, error } = await supabase
        .from("carcontrol_payment_schedules")
        .select("valor")
        .eq("driver_id", id)
        .eq("ativo", true)
        .maybeSingle();

      if (!error && data) {
        setValorSemanal(data.valor);
      } else {
        setValorSemanal(0);
      }
    };

    fetchValorSemanal();
  }, [id]);

  // Vehicle and maintenances fetched reactively when driver.veiculo_id is known
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (!driver?.veiculo_id) {
      setVehicle(null);
      setMaintenances([]);
      return;
    }
    let cancelled = false;
    setLoadingVehicle(true);
    (async () => {
      const [{ data: vData }, { data: mData }] = await Promise.all([
        supabase
          .from("carcontrol_vehicles")
          .select("*")
          .eq("id", driver.veiculo_id!)
          .single(),
        supabase
          .from("carcontrol_maintenances")
          .select("*")
          .eq("vehicle_id", driver.veiculo_id!)
          .order("data", { ascending: false }),
      ]);
      if (cancelled) return;
      setVehicle(vData ?? null);
      setMaintenances(mData ?? []);
      setLoadingVehicle(false);
    })();
    return () => { cancelled = true; };
  }, [driver?.veiculo_id]);

  const loading = loadingDriver || loadingPayments || loadingVehicle;

  // Group payments by month for the line chart (last 12 months)
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) {
      const d = new Date(p.data + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + p.valor);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, valor]) => {
        const [year, month] = key.split("-");
        return {
          mes: `${MONTHS[parseInt(month) - 1]}/${year.slice(2)}`,
          valor,
        };
      });
  }, [payments]);

  // Payment status breakdown for pie chart
  const paymentByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) {
      map.set(p.status, (map.get(p.status) ?? 0) + p.valor);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [payments]);

  // Maintenance by type for second pie chart
  const maintenanceByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of maintenances) {
      map.set(m.tipo, (map.get(m.tipo) ?? 0) + m.valor);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [maintenances]);

  const totalReceita = payments.reduce((s, p) => s + p.valor, 0);
  const totalPago = payments.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0);
  const totalPendente = payments.filter((p) => p.status !== "pago").reduce((s, p) => s + p.valor, 0);
  const totalManutencao = maintenances.reduce((s, m) => s + m.valor, 0);

  const documents = [
    driver?.contrato_url
      ? { label: "Contrato", url: driver.contrato_url, color: "border-emerald-500/20 text-emerald-500", icon: "bg-emerald-500/10" }
      : null,
    driver?.antecedentes_url
      ? { label: "Antecedentes Criminais", url: driver.antecedentes_url, color: "border-blue-500/20 text-blue-500", icon: "bg-blue-500/10" }
      : null,
    driver?.comprovante_residencia_url
      ? { label: "Comprovante de Residência", url: driver.comprovante_residencia_url, color: "border-purple-500/20 text-purple-500", icon: "bg-purple-500/10" }
      : null,
  ].filter(Boolean) as { label: string; url: string; color: string; icon: string }[];

  const statusStyle2 = driver ? (statusStyle[driver.status] ?? "bg-muted/20 text-muted-foreground border border-border/50") : "";

  if (loadingDriver) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!driver) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">Motorista não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/motoristas")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </AppShell>
    );
  }

  const initials = driver.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
  const isDark = theme === "dark";

  return (
    <AppShell>
      <Topbar
        title={driver.nome}
        subtitle={`CPF ${driver.cpf} · ${driver.status}`}
        helpPath="/ajuda/gestao/motoristas"
      />

      {/* Back */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/motoristas")}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para motoristas
        </Button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyle2}`}>
          {driver.status}
        </span>
      </div>

      {/* ── Profile Header ─────────────────────────────────────────── */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {driver.foto_url ? (
              <img
                src={driver.foto_url}
                alt={driver.nome}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary ring-4 ring-primary/10">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight text-foreground">{driver.nome}</h1>
            <p className="text-muted-foreground mt-1">CPF {driver.cpf}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">CNH</div>
                <div className="font-mono font-medium mt-0.5 text-foreground">{driver.cnh}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Telefone</div>
                <div className="font-medium mt-0.5 flex items-center gap-1.5 text-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {driver.telefone}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Início</div>
                <div className="font-medium mt-0.5 flex items-center gap-1.5 text-foreground">
                  <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                  {fmtDate(driver.inicio)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Veículo</div>
                <div className="font-medium mt-0.5 flex items-center gap-1.5 text-foreground">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  {vehicle ? `${vehicle.modelo} · ${vehicle.placa}` : "Sem veículo"}
                </div>
              </div>
            </div>
          </div>

          {/* Financial summary badges */}
          <div className="flex-shrink-0 flex flex-col gap-2 items-end">
            <div className="neu-inset px-4 py-3 text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Semanal</div>
              <div className="font-display font-bold text-base mt-0.5 text-foreground">{fmtBRL(valorSemanal)}</div>
            </div>
            <div className="neu-inset px-4 py-3 text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Caução</div>
              <div className="font-display font-bold text-base mt-0.5 text-foreground">{fmtBRL(driver.caucao)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="neu p-5 animate-blur-in">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Total recebido
          </div>
          <div className="font-display text-xl font-bold text-primary">
            {fmtBRL(totalReceita)}
          </div>
          <DollarSign className="w-4 h-4 text-primary mt-2" />
        </div>

        <div className="neu p-5 animate-blur-in delay-75">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Pagamentos ok
          </div>
          <div className="font-display text-xl font-bold text-emerald-500">
            {fmtBRL(totalPago)}
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500 mt-2" />
        </div>

        <div className="neu p-5 animate-blur-in delay-150">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Em aberto
          </div>
          <div className={`font-display text-xl font-bold ${totalPendente > 0 ? "text-amber-500" : "text-foreground"}`}>
            {fmtBRL(totalPendente)}
          </div>
          {totalPendente > 0 ? (
            <TrendingDown className="w-4 h-4 text-amber-500 mt-2" />
          ) : (
            <TrendingUp className="w-4 h-4 text-emerald-500 mt-2" />
          )}
        </div>

        <div className="neu p-5 animate-blur-in delay-300">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Manut. veículo
          </div>
          <div className="font-display text-xl font-bold text-orange-500">
            {fmtBRL(totalManutencao)}
          </div>
          <Wrench className="w-4 h-4 mt-2 text-orange-500" />
        </div>
      </div>

      {/* ── Document Cards ──────────────────────────────────────────── */}
      {documents.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-base font-bold mb-4 flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4 text-primary" /> Documentos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <button
                key={doc.label}
                onClick={() => window.open(doc.url, "_blank")}
                className={`neu group border ${doc.color} p-5 text-left hover:neu-interactive transition-all duration-300 cursor-pointer rounded-2xl`}
              >
                <div className={`w-10 h-10 rounded-xl ${doc.icon} flex items-center justify-center mb-3`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-semibold text-sm leading-tight text-foreground">{doc.label}</div>
                <div className="text-xs mt-1 opacity-70 flex items-center gap-1 text-muted-foreground">
                  <ExternalLink className="w-3 h-3" />
                  Clique para visualizar
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line chart – monthly payments */}
        <div className="neu p-6 animate-blur-in">
          <h2 className="font-display text-base font-bold flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" /> Faturamento Mensal
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            Pagamentos registrados nos últimos meses
          </p>
          {monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
              Nenhum pagamento registrado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? darkChartTheme.grid : "currentColor"} strokeOpacity={isDark ? 1 : 0.08} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [fmtBRL(value), "Pagamentos"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart – payment status */}
        <div className="neu p-6 animate-blur-in delay-75">
          <h2 className="font-display text-base font-bold flex items-center gap-2 text-foreground">
            <Banknote className="w-4 h-4 text-primary" /> Status dos Pagamentos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            Distribuição por status financeiro
          </p>
          {paymentByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
              Nenhum pagamento registrado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentByStatus.map((entry, index) => {
                    const c = entry.name === "pago" ? "#4ADE80" : entry.name === "pendente" ? "#FFBD4C" : "#FF6B6B";
                    return <Cell key={entry.name} fill={c} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [fmtBRL(value), "Valor"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
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

      {/* Pie chart – maintenance by type (only if linked to vehicle) */}
      {vehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="neu p-6 animate-blur-in">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Manutenção por Tipo
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-5">
              Custos de manutenção do veículo vinculado
            </p>
            {maintenanceByType.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">
                Nenhuma manutenção registrada
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
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
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

          {/* Vehicle summary card */}
          <div className="neu p-6 animate-blur-in delay-75">
            <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
              <Car className="w-4 h-4" /> Veículo Vinculado
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">{vehicle.modelo}</div>
                <div className="text-muted-foreground text-sm">{vehicle.marca} · {vehicle.ano}</div>
                <div className="font-mono text-xs mt-0.5 text-primary font-bold">{vehicle.placa}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "KM atual", value: vehicle.km_atual.toLocaleString("pt-BR") },
                { label: "Cor", value: vehicle.cor },
                { label: "Receita/mês", value: fmtBRL(vehicle.receita_mes) },
                { label: "Custo/mês", value: fmtBRL(vehicle.custo_mes) },
              ].map(({ label, value }) => (
                <div key={label} className="neu-inset px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full gap-2"
              onClick={() => navigate(`/veiculos/${vehicle.id}`)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver detalhes do veículo
            </Button>
          </div>
        </div>
      )}

      {/* ── Payment History ──────────────────────────────────────────── */}
      <div className="neu p-6 mb-8 animate-blur-in overflow-x-auto">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Histórico de Pagamentos
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

      {/* ── Maintenance History ──────────────────────────────────────── */}
      {vehicle && (
        <div className="neu p-6 mb-8 animate-blur-in overflow-x-auto">
          <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Histórico de Manutenção
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              {vehicle.modelo} · {vehicle.placa}
            </span>
          </h2>
          {maintenances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma manutenção registrada para o veículo.
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
      )}

      {/* ── Driver Info Details ──────────────────────────────────────── */}
      <div className="neu p-6 mb-8 animate-blur-in">
        <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
          <User className="w-4 h-4" /> Dados Cadastrais
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 text-sm">
          {[
            { label: "Nome completo", value: driver.nome },
            { label: "CPF", value: driver.cpf, mono: true },
            { label: "CNH", value: driver.cnh, mono: true },
            { label: "Telefone", value: driver.telefone },
            { label: "Data de início", value: fmtDate(driver.inicio) },
            { label: "Status", value: driver.status },
            { label: "Valor semanal", value: fmtBRL(valorSemanal) },
            { label: "Caução", value: fmtBRL(driver.caucao) },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
              <div className={`font-medium mt-0.5 ${mono ? "font-mono" : ""} capitalize`}>
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
