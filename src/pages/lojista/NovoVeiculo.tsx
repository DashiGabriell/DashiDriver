import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const NovoVeiculo = () => {
  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Adicionar Novo Veículo</h1>
        <form className="neu p-6 rounded-lg space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Modelo</Label><Input placeholder="Ex: Fiat Pulse" /></div>
            <div><Label>Marca</Label><Input placeholder="Ex: Fiat" /></div>
            <div><Label>Ano</Label><Input type="number" placeholder="2023" /></div>
            <div><Label>KM</Label><Input type="number" placeholder="5000" /></div>
            <div><Label>Valor (R$)</Label><Input type="number" placeholder="110000" /></div>
            <div><Label>Cidade</Label><Input placeholder="Cidade" /></div>
            <div><Label>Estado</Label><Input placeholder="Estado" /></div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea placeholder="Detalhes do veículo..." />
          </div>
          <div>
            <Label>Fotos</Label>
            <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center mt-2">Upload de fotos</div>
          </div>
          <Button className="w-full">Salvar Veículo</Button>
        </form>
      </div>
    </LojistaAppShell>
  );
};

export default NovoVeiculo;
