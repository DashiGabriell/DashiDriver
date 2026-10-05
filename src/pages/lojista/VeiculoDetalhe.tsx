import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VeiculoDetalhe = () => {
  const veiculo = { 
    modelo: "Fiat Pulse", ano: 2023, km: 5000, preco: "R$ 110.000", motor: "1.3 Turbo", combustivel: "Flex", transmissao: "Automática", condicao: "Excelente", disponibilidade: "Disponível" 
  };

  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">{veiculo.modelo}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="neu">
            <CardContent className="p-6 space-y-2">
              <h2 className="font-bold text-lg mb-4">Informações</h2>
              <p>Ano: {veiculo.ano}</p>
              <p>KM: {veiculo.km}</p>
              <p>Motor: {veiculo.motor}</p>
              <p>Combustível: {veiculo.combustivel}</p>
              <p>Transmissão: {veiculo.transmissao}</p>
            </CardContent>
          </Card>
          <Card className="neu">
            <CardContent className="p-6 space-y-2">
              <h2 className="font-bold text-lg mb-4">Comercial</h2>
              <p className="text-3xl font-bold text-primary">{veiculo.preco}</p>
              <p>Condição: {veiculo.condicao}</p>
              <p>Disponibilidade: {veiculo.disponibilidade}</p>
              <Button className="mt-4 w-full">Editar Veículo</Button>
            </CardContent>
          </Card>
        </div>
        <Card className="neu">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4">Galeria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-lg flex items-center justify-center">Foto {i}</div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </LojistaAppShell>
  );
};

export default VeiculoDetalhe;
