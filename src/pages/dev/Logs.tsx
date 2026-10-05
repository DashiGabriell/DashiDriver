import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dev/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogs, type AlertLog } from "@/hooks/dev/useLogs";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const TIPO_LABELS: Record<string, string> = {
  pagamento: "Pagamento",
  seguro: "Seguro",
  manutencao: "Manutenção",
  documento: "Documento",
  contrato: "Contrato",
  ocioso: "Ocioso",
  sistema: "Sistema",
};

const TIPO_OPTIONS = [
  "all",
  "pagamento",
  "seguro",
  "manutencao",
  "documento",
  "contrato",
  "ocioso",
  "sistema",
] as const;

const SEVERIDADE_OPTIONS = ["all", "info", "atencao", "critico"] as const;

type TipoFilter = (typeof TIPO_OPTIONS)[number];
type SeveridadeFilter = (typeof SEVERIDADE_OPTIONS)[number];

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

function severityVariant(
  severidade: string,
): "default" | "destructive" | "outline" {
  if (severidade === "critico") return "destructive";
  if (severidade === "atencao") return "outline";
  return "default";
}

export default function Logs() {
  const [tipo, setTipo] = useState<TipoFilter>("all");
  const [severidade, setSeveridade] = useState<SeveridadeFilter>("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ tipo, severidade, page }),
    [tipo, severidade, page],
  );

  const { data, isLoading, error } = useLogs(filters);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Logs e Auditoria</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total de Alertas" value={data?.total ?? 0} />
        <StatCard
          title="Críticos"
          value={data?.critical ?? 0}
          description="Severidade máxima"
        />
        <StatCard
          title="Listados"
          value={data?.alerts.length ?? 0}
          description="Filtro atual"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo</label>
                <Select
                  value={tipo}
                  onValueChange={(value) => {
                    setTipo(value as TipoFilter);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "all" ? "Todos" : (TIPO_LABELS[opt] ?? opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Severidade</label>
                <Select
                  value={severidade}
                  onValueChange={(value) => {
                    setSeveridade(value as SeveridadeFilter);
                    setPage(1);
                  }}
                >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERIDADE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "all" ? "Todas" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            Eventos do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Carregando alertas...</p>
          ) : error ? (
            <p className="text-red-400 text-sm">
              Erro ao carregar: {(error as Error).message}
            </p>
          ) : !data || data.alerts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum alerta encontrado para os filtros selecionados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Quando</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Severidade</TableHead>
                  <TableHead className="text-muted-foreground">Título</TableHead>
                  <TableHead className="text-muted-foreground">Empresa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.alerts.map((alert: AlertLog) => (
                  <TableRow key={alert.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(alert.created_at)}
                    </TableCell>
                    <TableCell>
                      {TIPO_LABELS[alert.tipo] ?? alert.tipo}
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(alert.severidade)}>
                        {alert.severidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-medium truncate">{alert.titulo}</p>
                      {alert.descricao && (
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.descricao}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {alert.empresa_nome || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                Página {data.page} de {data.totalPages} ({data.total} eventos)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {page} / {data.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
