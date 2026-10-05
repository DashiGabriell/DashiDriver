import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dev/StatCard";
import { darkChartTheme } from "@/components/charts/ChartTheme";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsOverview } from "@/hooks/dev/useAnalyticsOverview";

const lightChartTheme = {
  text: "#374151",
  grid: "#E5E7EB",
  tooltip: {
    background: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
  },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ALERT_TYPE_LABELS: Record<string, string> = {
  pagamento: "Pagamento",
  seguro: "Seguro",
  manutencao: "Manutenção",
  documento: "Documento",
  contrato: "Contrato",
  ocioso: "Ocioso",
  sistema: "Sistema",
};

const PIE_COLORS = [
  darkChartTheme.colors.primary,
  darkChartTheme.colors.secondary,
  darkChartTheme.colors.success,
  darkChartTheme.colors.warning,
  darkChartTheme.colors.error,
  "#A78BFA",
  "#34D399",
];

function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

function asPieData(record: Record<string, number>) {
  return Object.entries(record)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: ALERT_TYPE_LABELS[name] ?? name,
      value,
    }));
}

function useChartTheme() {
  return useMemo(() => {
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? darkChartTheme : lightChartTheme;
  }, []);
}

export default function Analytics() {
  const { data, isLoading, error } = useAnalyticsOverview();
  const theme = useChartTheme();

  const tooltipStyle = {
    backgroundColor: theme.tooltip.background,
    border: `1px solid ${theme.tooltip.border}`,
    borderRadius: 6,
    color: theme.tooltip.text,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics do Produto</h2>
        <p className="text-muted-foreground">Carregando indicadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics do Produto</h2>
        <p className="text-red-400">Erro ao carregar: {(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  const pieData = asPieData(data.alertsDistribution.byType);
  const severityData = Object.entries(data.alertsDistribution.bySeverity).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics do Produto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Confirmada"
          value={formatCurrency(data.totalRevenue)}
          description="Histórico de pagamentos"
        />
        <StatCard
          title="Total de Pagamentos"
          value={data.totalPayments}
          description="Receita + pendentes"
        />
        <StatCard
          title="Alertas não resolvidos"
          value={data.alertsDistribution.unresolved}
          description={`${data.alertsDistribution.total} totais`}
        />
        <StatCard title="Motoristas" value={data.totalDrivers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">
              Empresas criadas (últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.companyGrowth.buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis dataKey="label" stroke={theme.text} />
                <YAxis stroke={theme.text} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  name="Empresas"
                  fill={darkChartTheme.colors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">
              Receita por mês (BRL)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.companyGrowth.buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis dataKey="label" stroke={theme.text} />
                <YAxis stroke={theme.text} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="receita"
                  name="Receita"
                  fill={darkChartTheme.colors.success}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">
              Alertas por tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {pieData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum alerta registrado.</p>
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
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
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
              Alertas por severidade
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                <XAxis dataKey="name" stroke={theme.text} />
                <YAxis stroke={theme.text} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="value"
                  name="Alertas"
                  fill={darkChartTheme.colors.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground">
            Status dos Motoristas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Ativos"
              value={data.driverStatus.ativo}
              description="Em operação normal"
            />
            <StatCard
              title="Atrasados"
              value={data.driverStatus.atrasado}
              description="Pendências financeiras"
            />
            <StatCard
              title="Encerrados"
              value={data.driverStatus.encerrado}
              description="Contratos finalizados"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
