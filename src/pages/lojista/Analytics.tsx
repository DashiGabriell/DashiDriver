import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { darkChartTheme } from "@/components/charts/ChartTheme";

const dataInteracoes = [
  { mes: 'Jan', interacoes: 40 },
  { mes: 'Fev', interacoes: 30 },
  { mes: 'Mar', interacoes: 50 },
  { mes: 'Abr', interacoes: 70 },
];

const dataEstados = [
  { estado: 'SP', demanda: 80 },
  { estado: 'RJ', demanda: 60 },
  { estado: 'MG', demanda: 40 },
];

const dataModelos = [
  { name: 'Fiat Pulse', value: 400 },
  { name: 'VW Nivus', value: 300 },
  { name: 'Outros', value: 200 },
];

const COLORS = [darkChartTheme.colors.primary, darkChartTheme.colors.secondary, darkChartTheme.colors.success];

const Analytics = () => {
  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Oportunidades Visualizadas", value: "150" },
            { label: "Interações Geradas", value: "20" },
            { label: "Taxa de Conversão", value: "10%" },
            { label: "Vendas Confirmadas", value: "2" },
          ].map((kpi) => (
            <Card key={kpi.label} className="neu">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="neu">
            <CardHeader><CardTitle>Interações por mês</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataInteracoes}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkChartTheme.grid} />
                  <XAxis dataKey="mes" stroke={darkChartTheme.text} />
                  <YAxis stroke={darkChartTheme.text} />
                  <Tooltip contentStyle={{ backgroundColor: darkChartTheme.tooltip.background, borderColor: darkChartTheme.tooltip.border }} />
                  <Line type="monotone" dataKey="interacoes" stroke={darkChartTheme.colors.primary} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="neu">
            <CardHeader><CardTitle>Estados com maior demanda</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataEstados}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkChartTheme.grid} />
                  <XAxis dataKey="estado" stroke={darkChartTheme.text} />
                  <YAxis stroke={darkChartTheme.text} />
                  <Tooltip contentStyle={{ backgroundColor: darkChartTheme.tooltip.background, borderColor: darkChartTheme.tooltip.border }} />
                  <Bar dataKey="demanda" fill={darkChartTheme.colors.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="neu">
          <CardHeader><CardTitle>Modelos mais procurados</CardTitle></CardHeader>
          <CardContent className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataModelos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill={darkChartTheme.colors.primary} label>
                  {dataModelos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkChartTheme.tooltip.background, borderColor: darkChartTheme.tooltip.border }} />
              </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="neu">
          <CardHeader><CardTitle>Últimas conversões</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>29/05/2026</TableCell>
                  <TableCell>Fiat Pulse</TableCell>
                  <TableCell>R$ 110.000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LojistaAppShell>
  );
};

export default Analytics;
