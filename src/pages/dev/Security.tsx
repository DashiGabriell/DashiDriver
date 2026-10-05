import { useState, useMemo, useCallback } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { StatCard } from "@/components/dev/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { darkChartTheme } from "@/components/charts/ChartTheme";
import {
  ShieldAlert, ShieldOff, Search, ChevronLeft, ChevronRight,
  Scan, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSecurityDenylist, type DenylistEntry } from "@/hooks/dev/useSecurityDenylist";
import { useSecurityScanLog, type ScanLogEntry } from "@/hooks/dev/useSecurityScanLog";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PIE_COLORS = [
  darkChartTheme.colors.primary,
  darkChartTheme.colors.secondary,
  darkChartTheme.colors.success,
  darkChartTheme.colors.error,
  darkChartTheme.colors.warning,
];

const PERIODS = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "all", label: "Tudo" },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

const ITEMS_PER_PAGE = 15;

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

function isExpired(entry: DenylistEntry) {
  if (!entry.expires_at) return false;
  return new Date(entry.expires_at) < new Date();
}

function statusInfo(entry: DenylistEntry) {
  if (isExpired(entry)) {
    return { label: "Expirado", variant: "secondary" as const };
  }
  return { label: "Ativo", variant: "destructive" as const };
}

function reasonLabel(reason: string) {
  if (reason.includes("Brute") || reason.includes("brute")) return "Brute Force";
  if (reason.includes("Flood") || reason.includes("flood") || reason.includes("signup")) return "Signup Flood";
  if (reason.includes("replay") || reason.includes("Replay") || reason.includes("Token")) return "Token Replay";
  if (reason.includes("agent") || reason.includes("Agent")) return "User Agent Suspeito";
  if (reason.includes("Injection") || reason.includes("injection") || reason.includes("SQL")) return "SQL Injection";
  return reason.length > 30 ? reason.slice(0, 30) + "..." : reason;
}

function lightChartTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) return darkChartTheme;
  return {
    text: "#374151",
    grid: "#E5E7EB",
    tooltip: { background: "#FFFFFF", border: "#E5E7EB", text: "#111827" },
    colors: darkChartTheme.colors,
    background: "#FFFFFF",
  };
}

export default function Security() {
  const { data, isLoading, error } = useSecurityDenylist();
  const { data: scanLogs } = useSecurityScanLog();
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<PeriodKey>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [scanLogPeriod, setScanLogPeriod] = useState<PeriodKey>("all");
  const [scanLogPage, setScanLogPage] = useState(0);
  const [scanning, setScanning] = useState(false);

  const triggerScan = useCallback(async () => {
    setScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sessao expirada");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/trigger-security-scan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao executar scan");

      toast.success(
        `Scan concluido — ${result.threats_detected} ameacas detectadas, ${result.blocks_inserted} bloqueios inseridos`,
        { duration: 5000 },
      );

      queryClient.invalidateQueries({ queryKey: ["dev-security"] });
      queryClient.invalidateQueries({ queryKey: ["dev-security-scan-log"] });
    } catch (err) {
      toast.error(`Falha no scan: ${(err as Error).message}`);
    } finally {
      setScanning(false);
    }
  }, [queryClient]);

  const theme = useMemo(() => lightChartTheme(), []);

  const tooltipStyle = {
    backgroundColor: theme.tooltip.background,
    border: `1px solid ${theme.tooltip.border}`,
    borderRadius: 6,
    color: theme.tooltip.text,
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let items = [...data];

    if (period !== "all") {
      const msMap: Record<string, number> = { "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, "30d": 30 * 24 * 60 * 60 * 1000 };
      const cutoff = Date.now() - msMap[period];
      items = items.filter((e) => new Date(e.blocked_at).getTime() >= cutoff);
    }

    if (reasonFilter !== "all") {
      items = items.filter((e) => reasonLabel(e.reason) === reasonFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          (e.ip_address && e.ip_address.toLowerCase().includes(q)) ||
          (e.user_id && e.user_id.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [data, period, reasonFilter, search]);

  const paginated = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const reasonOptions = useMemo(() => {
    if (!data) return [];
    const reasons = new Set(data.map((e) => reasonLabel(e.reason)));
    return Array.from(reasons).sort();
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, ips: 0, users: 0, last24h: 0 };
    const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;
    return {
      total: data.length,
      ips: new Set(data.filter((e) => e.ip_address).map((e) => e.ip_address)).size,
      users: new Set(data.filter((e) => e.user_id).map((e) => e.user_id)).size,
      last24h: data.filter((e) => new Date(e.blocked_at).getTime() >= cutoff24h).length,
    };
  }, [data]);

  const barData = useMemo(() => {
    if (!filtered.length) return [];
    const groups: Record<string, number> = {};
    for (const e of filtered) {
      const day = e.blocked_at.slice(0, 10);
      groups[day] = (groups[day] || 0) + 1;
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({
        day: day.slice(5),
        count,
      }));
  }, [filtered]);

  const pieData = useMemo(() => {
    if (!filtered.length) return [];
    const groups: Record<string, number> = {};
    for (const e of filtered) {
      const label = reasonLabel(e.reason);
      groups[label] = (groups[label] || 0) + 1;
    }
    return Object.entries(groups)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const topIpData = useMemo(() => {
    if (!filtered.length) return [];
    const groups: Record<string, number> = {};
    for (const e of filtered) {
      if (e.ip_address) {
        groups[e.ip_address] = (groups[e.ip_address] || 0) + 1;
      }
    }
    return Object.entries(groups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }, [filtered]);

  const cumulativeData = useMemo(() => {
    if (!filtered.length) return [];
    const groups: Record<string, number> = {};
    for (const e of filtered) {
      const day = e.blocked_at.slice(0, 10);
      groups[day] = (groups[day] || 0) + 1;
    }
    const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    let acc = 0;
    return sorted.map(([day, count]) => {
      acc += count;
      return { day: day.slice(5), total: acc };
    });
  }, [filtered]);

  const filteredScanLogs = useMemo(() => {
    if (!scanLogs) return [];
    if (scanLogPeriod === "all") return scanLogs;
    const msMap: Record<string, number> = { "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, "30d": 30 * 24 * 60 * 60 * 1000 };
    const cutoff = Date.now() - msMap[scanLogPeriod];
    return scanLogs.filter((e) => new Date(e.started_at).getTime() >= cutoff);
  }, [scanLogs, scanLogPeriod]);

  const paginatedScanLogs = useMemo(() => {
    const start = scanLogPage * ITEMS_PER_PAGE;
    return filteredScanLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredScanLogs, scanLogPage]);

  const scanTotalPages = Math.ceil(filteredScanLogs.length / ITEMS_PER_PAGE);

  function scanDuration(start: string, finish: string | null): string {
    if (!finish) return "—";
    const ms = new Date(finish).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  function scanStatusBadge(status: string) {
    if (status === "completed") return <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Concluído</Badge>;
    if (status === "running") return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30 animate-pulse">Executando</Badge>;
    if (status === "failed") return <Badge variant="destructive">Falhou</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  }

  function triggerLabel(t: string) {
    return t === "scheduled" ? "Agendado" : t === "manual" ? "Manual" : t;
  }

  if (error) {
    return (
      <DevPageContainer title="Security Monitor">
        <p className="text-red-500">
          Erro ao carregar dados: {(error as Error).message}
        </p>
      </DevPageContainer>
    );
  }

  return (
    <DevPageContainer title="Security Monitor">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Bloqueios" value={stats.total} description="Registros na denylist" />
          <StatCard title="IPs Bloqueados" value={stats.ips} description="Endereços distintos" />
          <StatCard title="Usuários Bloqueados" value={stats.users} description="Contas desativadas" />
          <StatCard title="Últimas 24h" value={stats.last24h} description="Novos bloqueios" />
        </div>

        <div className="flex items-center justify-end">
          <Button
            onClick={triggerScan}
            disabled={scanning}
            className="gap-2"
          >
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
            {scanning ? "Escaneando..." : "Scan Manual"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Bloqueios por Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {barData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="day" stroke={theme.text} fontSize={12} />
                    <YAxis stroke={theme.text} allowDecimals={false} fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Bloqueios" fill={darkChartTheme.colors.error} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Por Tipo de Ameaça
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {pieData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: theme.text }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Top IPs Bloqueados
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {topIpData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topIpData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis type="number" stroke={theme.text} allowDecimals={false} fontSize={12} />
                    <YAxis dataKey="ip" type="category" stroke={theme.text} fontSize={10} width={110} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Bloqueios" fill={darkChartTheme.colors.warning} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Acumulado de Bloqueios
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {cumulativeData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="day" stroke={theme.text} fontSize={12} />
                    <YAxis stroke={theme.text} allowDecimals={false} fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke={darkChartTheme.colors.primary}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPeriod(p.key); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p.key
                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <select
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
            value={reasonFilter}
            onChange={(e) => { setReasonFilter(e.target.value); setPage(0); }}
          >
            <option value="all">Todas as razões</option>
            {reasonOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar IP ou User ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShieldOff className="h-12 w-12 mb-3 text-muted-foreground/40" />
            <p className="text-sm">Nenhum bloqueio encontrado.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {filtered.length === 0 && data && data.length > 0
                ? "Tente ajustar os filtros."
                : "O security_monitor ainda não registrou nenhum bloqueio."}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead className="hidden lg:table-cell">User ID</TableHead>
                  <TableHead>Razão</TableHead>
                  <TableHead className="hidden lg:table-cell">Bloqueado por</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="hidden lg:table-cell">Expira</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((entry) => {
                  const status = statusInfo(entry);
                  return (
                    <TableRow key={entry.id} className="hover:bg-zinc-800/50 transition-colors">
                      <TableCell className="font-mono text-xs">
                        {entry.ip_address || (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                        {entry.user_id ? (
                          <span title={entry.user_id}>{entry.user_id.slice(0, 12)}...</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={entry.reason}>
                        {reasonLabel(entry.reason)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {entry.blocked_by}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDateTime(entry.blocked_at)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDate(entry.expires_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Histórico de Scans</h2>
            <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => { setScanLogPeriod(p.key); setScanLogPage(0); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    scanLogPeriod === p.key
                      ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {!scanLogs ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : paginatedScanLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldOff className="h-12 w-12 mb-3 text-muted-foreground/40" />
              <p className="text-sm">Nenhum scan encontrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Execute um scan manual para ver o primeiro registro.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Início</TableHead>
                    <TableHead className="hidden md:table-cell">Término</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ameaças</TableHead>
                    <TableHead className="text-right">Bloqueios</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Audit Logs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedScanLogs.map((entry: ScanLogEntry) => (
                    <TableRow key={entry.id} className="hover:bg-zinc-800/50 transition-colors">
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(entry.started_at)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDateTime(entry.finished_at)}
                      </TableCell>
                      <TableCell className="text-xs font-mono tabular-nums">
                        {scanDuration(entry.started_at, entry.finished_at)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {triggerLabel(entry.triggered_by)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scanStatusBadge(entry.status)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {entry.threats_detected}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {entry.blocks_inserted}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right font-mono text-xs tabular-nums">
                        {entry.audit_logs_analyzed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {scanTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {scanLogPage * ITEMS_PER_PAGE + 1}–{Math.min((scanLogPage + 1) * ITEMS_PER_PAGE, filteredScanLogs.length)} de {filteredScanLogs.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={scanLogPage <= 0}
                      onClick={() => setScanLogPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {scanLogPage + 1} / {scanTotalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={scanLogPage >= scanTotalPages - 1}
                      onClick={() => setScanLogPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DevPageContainer>
  );
}
