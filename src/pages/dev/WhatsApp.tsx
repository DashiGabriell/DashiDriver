import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dev/StatCard";
import { darkChartTheme } from "@/components/charts/ChartTheme";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useWhatsAppOverview, WhatsAppOverview } from "@/hooks/dev/useWhatsAppOverview";
import { PhoneCall, TrendingUp, Building2, Users, Calendar } from "lucide-react";

const tooltipStyle = {
  backgroundColor: darkChartTheme.tooltip.background,
  border: `1px solid ${darkChartTheme.tooltip.border}`,
  borderRadius: 6,
  color: darkChartTheme.tooltip.text,
  fontSize: 12,
};

const PIE_COLORS = [
  darkChartTheme.colors.primary,
  darkChartTheme.colors.secondary,
  darkChartTheme.colors.success,
  darkChartTheme.colors.warning,
  darkChartTheme.colors.error,
  "#A78BFA",
  "#34D399",
  "#F472B6",
  "#60A5FA",
  "#FBBF24",
];

type Period = "7d" | "30d" | "90d" | "all";

export default function WhatsApp() {
  const { data, isLoading, error } = useWhatsAppOverview();
  const [period, setPeriod] = useState<Period>("all");
  const [companyFilter, setCompanyFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!companyFilter.trim()) return data;

    const q = companyFilter.toLowerCase();

    const filterDay = (d: typeof data.clicksByDay[0]) => true;
    const filterCompany = (c: typeof data.clicksByCompany[0]) =>
      c.company.toLowerCase().includes(q);
    const filterListing = (l: typeof data.clicksByListing[0]) =>
      l.listing.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
    const filterRecent = (r: typeof data.recentClicks[0]) =>
      r.company.toLowerCase().includes(q) || r.listing.toLowerCase().includes(q);

    return {
      ...data,
      clicksByCompany: data.clicksByCompany.filter(filterCompany),
      clicksByListing: data.clicksByListing.filter(filterListing),
      recentClicks: data.recentClicks.filter(filterRecent),
    };
  }, [data, companyFilter]);

  const chartData = useMemo(() => {
    if (!filteredData) return [];
    const days = filteredData.clicksByDay;
    if (period === "7d") return days.slice(-7);
    if (period === "30d") return days.slice(-30);
    if (period === "90d") {
      const slice = days.slice(-90);
      const chunkSize = 3;
      const grouped: { label: string; count: number }[] = [];
      for (let i = 0; i < slice.length; i += chunkSize) {
        const s = slice.slice(i, i + chunkSize);
        grouped.push({
          label: `${s[0].label}${s.length > 1 ? `-${s[s.length - 1].label}` : ""}`,
          count: s.reduce((sum, d) => sum + d.count, 0),
        });
      }
      return grouped;
    }
    return days;
  }, [filteredData, period]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">WhatsApp Analytics</h2>
        <p className="text-muted-foreground">Carregando dados de cliques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">WhatsApp Analytics</h2>
        <p className="text-destructive">Erro ao carregar: {(error as Error).message}</p>
      </div>
    );
  }

  if (!filteredData) return null;

  const topListings = filteredData.clicksByListing.slice(0, 10);
  const topCompanies = filteredData.clicksByCompany.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-500" />
            WhatsApp Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard de cliques no WhatsApp do Marketplace
          </p>
        </div>
        <Badge variant="outline" className="bg-card border-border text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          {filteredData.firstClickDate
            ? `${new Date(filteredData.firstClickDate).toLocaleDateString("pt-BR")} - ${new Date().toLocaleDateString("pt-BR")}`
            : "Sem dados"}
        </Badge>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
          {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filtrar por locadora ou anúncio..."
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="flex-1 min-w-[200px] max-w-xs bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Cliques"
          value={filteredData.totalClicks}
          description="Cliques no botão WhatsApp"
        />
        <StatCard
          title="Locadoras"
          value={filteredData.totalCompanies}
          description="Locadoras que receberam cliques"
        />
        <StatCard
          title="Anúncios"
          value={filteredData.totalListings}
          description="Anúncios únicos clicados"
        />
        <StatCard
          title="Motoristas"
          value={filteredData.totalUsers}
          description="Usuários únicos que clicaram"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Cliques por Dia
            </CardTitle>
            <Badge variant="outline" className="bg-secondary border-border text-muted-foreground text-[10px]">
              {period.replace("d", " dias")}
            </Badge>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum clique no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkChartTheme.grid} />
                  <XAxis dataKey="label" stroke={darkChartTheme.text} fontSize={10} tickMargin={4} />
                  <YAxis stroke={darkChartTheme.text} allowDecimals={false} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Cliques" fill={darkChartTheme.colors.primary} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Cliques por Hora do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {filteredData.clicksByHour.every((h) => h.count === 0) ? (
              <p className="text-muted-foreground text-sm">Nenhum clique registrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.clicksByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkChartTheme.grid} />
                  <XAxis dataKey="label" stroke={darkChartTheme.text} fontSize={10} tickMargin={4} interval={2} />
                  <YAxis stroke={darkChartTheme.text} allowDecimals={false} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Cliques" fill={darkChartTheme.colors.secondary} radius={[3, 3, 0, 0]}>
                    {filteredData.clicksByHour.map((entry, i) => (
                      <Cell
                        key={entry.hour}
                        fill={
                          entry.count > 0
                            ? `hsl(${120 - (entry.count / Math.max(...filteredData.clicksByHour.map((h) => h.count))) * 120}, 70%, 50%)`
                            : darkChartTheme.grid
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              Top Locadoras
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {topCompanies.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma locadora com cliques.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompanies} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkChartTheme.grid} />
                  <XAxis type="number" stroke={darkChartTheme.text} allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="company" stroke={darkChartTheme.text} fontSize={10} tickMargin={4} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Cliques" radius={[0, 3, 3, 0]}>
                    {topCompanies.map((entry, i) => (
                      <Cell key={entry.company} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              Top Anúncios
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72 overflow-y-auto">
            {topListings.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum anúncio com cliques.</p>
            ) : (
              <div className="space-y-3">
                {topListings.map((item, i) => (
                  <div key={item.listingId} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{item.listing}</p>
                        <span className="text-sm font-bold text-emerald-600 ml-2">{item.count}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{item.company}</p>
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(item.count / topListings[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border text-foreground">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              Últimos Cliques
            </CardTitle>
            <Badge variant="outline" className="bg-secondary border-border text-muted-foreground text-[10px]">
              {filteredData.recentClicks.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Locadora</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Anúncio</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.recentClicks.map((click) => (
                  <tr key={click.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{click.company}</td>
                    <td className="py-3 px-4 text-muted-foreground">{click.listing}</td>
                    <td className="py-3 px-4 text-muted-foreground text-right whitespace-nowrap">
                      {new Date(click.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {filteredData.recentClicks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhum clique registrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
