import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PortaldoLojista = () => {
  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Lojista Hub</h1>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Oportunidades Disponíveis", value: "12" },
            { label: "Interações Realizadas", value: "5" },
            { label: "Leads Ativados", value: "3" },
            { label: "Vendas Confirmadas", value: "1" },
            { label: "Taxa de Conversão", value: "8.3%" },
          ].map((kpi) => (
            <Card key={kpi.label} className="neu">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico */}
        <Card className="neu">
          <CardHeader><CardTitle>Interações por mês</CardTitle></CardHeader>
          <CardContent className="h-64 bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground">
            [Gráfico de Interações]
          </CardContent>
        </Card>

        {/* Cards Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="bg-blue-600 text-white shadow-[0_4px_0_0_#1e40af] hover:bg-blue-700 active:shadow-none active:translate-y-[4px] transition-all h-12 text-md"><Link to="/lojista/oportunidades">Ver Oportunidades</Link></Button>
          <Button asChild className="bg-blue-600 text-white shadow-[0_4px_0_0_#1e40af] hover:bg-blue-700 active:shadow-none active:translate-y-[4px] transition-all h-12 text-md"><Link to="/lojista/estoque/novo">Cadastrar Veículo</Link></Button>
          <Button asChild className="bg-blue-600 text-white shadow-[0_4px_0_0_#1e40af] hover:bg-blue-700 active:shadow-none active:translate-y-[4px] transition-all h-12 text-md"><Link to="/lojista/estoque">Atualizar Estoque</Link></Button>
        </div>

        {/* Tabela */}
        <Card className="neu">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas oportunidades acessadas</CardTitle>
            <Button variant="ghost" asChild><Link to="/lojista/oportunidades">Ver tudo <ArrowRight className="ml-2 w-4 h-4"/></Link></Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Locadora</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Loc...</TableCell>
                  <TableCell>Fiat Pulse</TableCell>
                  <TableCell>29/05/2026</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LojistaAppShell>
  );
};

export default PortaldoLojista;
