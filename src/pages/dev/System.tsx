import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dev/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSystemHealth, type ServiceStatus, type TableHealth } from "@/hooks/dev/useSystemHealth";

const TABLE_CATEGORIES: { label: string; prefix: string }[] = [
  { label: "Core", prefix: "carcontrol_" },
  { label: "Marketplace", prefix: "marketplace_" },
  { label: "Sistema", prefix: "" },
];

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

function statusBadge(status: ServiceStatus) {
  if (status === "online") return <Badge variant="default">Online</Badge>;
  if (status === "degraded") return <Badge variant="outline">Degradado</Badge>;
  return <Badge variant="destructive">Offline</Badge>;
}

function statusDot(status: ServiceStatus) {
  const color =
    status === "online"
      ? "bg-emerald-400"
      : status === "degraded"
        ? "bg-amber-400"
        : "bg-red-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function latencyColor(ms: number | null) {
  if (ms === null) return "text-red-400";
  if (ms < 400) return "text-emerald-400";
  if (ms < 1500) return "text-amber-400";
  return "text-red-400";
}

export default function System() {
  const { data, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Monitoramento Técnico</h2>
        <p className="text-muted-foreground">Verificando saúde do sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Monitoramento Técnico</h2>
        <p className="text-red-400">Erro ao verificar: {(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Monitoramento Técnico</h2>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-muted-foreground">Status Geral</CardTitle>
            <div className="flex items-center gap-2">
              {statusDot(data.overall)}
              {statusBadge(data.overall)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Latência DB</p>
              <p className={`text-2xl font-bold ${latencyColor(data.dbLatencyMs)}`}>
                {data.dbLatencyMs === null ? "—" : `${data.dbLatencyMs} ms`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Última Verificação</p>
              <p className="text-base text-foreground mt-1">
                {formatDateTime(data.lastSyncAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Tabelas Monitoradas</p>
              <p className="text-2xl font-bold text-foreground">
                {data.tables.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Empresas Ativas"
          value={data.activeCompanies}
          description={`${data.totalCompanies} totais`}
        />
        <StatCard
          title="Motoristas Ativos"
          value={data.activeDrivers}
          description={`${data.totalDrivers} totais`}
        />
        <StatCard
          title="Latência Média"
          value={
            data.dbLatencyMs === null
              ? "—"
              : `${data.dbLatencyMs} ms`
          }
          description="Banco principal"
        />
        <StatCard
          title="Saúde"
          value={
            data.overall === "online"
              ? "100%"
              : data.overall === "degraded"
                ? "Parcial"
                : "Crítico"
          }
          description={`${data.tables.filter((t) => t.status === "online").length}/${data.tables.length} OK`}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            Saúde por Tabela
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Tabela</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Registros</TableHead>
                <TableHead className="text-muted-foreground text-right">Latência</TableHead>
                <TableHead className="text-muted-foreground">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tables.map((table: TableHealth) => {
                const category = TABLE_CATEGORIES.find((c) =>
                  c.prefix ? table.table.startsWith(c.prefix) : !table.table.startsWith("carcontrol_") && !table.table.startsWith("marketplace_"),
                );
                return (
                  <TableRow key={table.table}>
                    <TableCell className="font-mono text-xs">
                      {table.table}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        {category?.label ?? "Outros"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusDot(table.status)}
                        {statusBadge(table.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {table.count === null ? "—" : table.count.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-xs tabular-nums ${latencyColor(
                        table.latencyMs,
                      )}`}
                    >
                      {table.latencyMs === null ? "—" : `${table.latencyMs} ms`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {table.error ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
