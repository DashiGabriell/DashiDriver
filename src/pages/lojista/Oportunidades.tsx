import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OportunidadeDetalhe } from "@/components/lojista/OportunidadeDetalhe";

const Oportunidades = () => {
  const oportunidades = [
    { locadora: "LOC", cidade: "São Paulo", estado: "SP", modelo: "Fiat Pulse", qtd: 5, orcamento: "R$ 600.000", data: "29/05/2026" },
    { locadora: "DAS", cidade: "Rio de Janeiro", estado: "RJ", modelo: "VW Nivus", qtd: 3, orcamento: "R$ 450.000", data: "28/05/2026" },
  ];

  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Oportunidades</h1>
        
        {/* Filtros */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 neu p-4 rounded-lg">
          <Input placeholder="Estado" />
          <Input placeholder="Cidade" />
          <Input placeholder="Modelo" />
          <Input placeholder="Faixa de Preço" />
          <Input placeholder="Qtd" />
          <Input placeholder="Data" />
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oportunidades.map((op, index) => (
            <Card key={index} className="neu transition-all hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(37,99,235,0.3)]">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{op.locadora}*** - {op.cidade}/{op.estado}</h3>
                </div>
                <p className="text-muted-foreground">Modelo procurado: <span className="font-medium text-foreground">{op.modelo}</span></p>
                <div className="flex justify-between items-center">
                    <p className="text-sm">Quantidade: <span className="font-semibold">{op.qtd}</span></p>
                    <p className="font-bold text-lg text-primary">{op.orcamento}</p>
                </div>
                <p className="text-xs text-muted-foreground">Publicado em: {op.data}</p>
                
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_0_#128c7e] active:shadow-none active:translate-y-[4px] transition-all">Tenho Interesse</Button>
                  <OportunidadeDetalhe oportunidade={op} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LojistaAppShell>
  );
};

export default Oportunidades;
