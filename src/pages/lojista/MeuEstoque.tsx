import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const MeuEstoque = () => {
  const veiculos = [
    { id: "1", foto: "🚗", modelo: "Fiat Pulse", ano: 2023, km: 5000, preco: "R$ 110.000", cidade: "SP", status: "Disponível" },
    { id: "2", foto: "🚗", modelo: "VW Nivus", ano: 2022, km: 12000, preco: "R$ 130.000", cidade: "RJ", status: "Vendido" },
  ];

  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meu Estoque</h1>
          <Button asChild className="bg-black text-white hover:bg-black/90"><Link to="/lojista/estoque/novo">Adicionar Veículo</Link></Button>
        </div>
        <div className="neu p-2 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-2xl">{v.foto}</TableCell>
                  <TableCell className="font-medium">{v.modelo}</TableCell>
                  <TableCell>{v.ano}</TableCell>
                  <TableCell>{v.km.toLocaleString()}</TableCell>
                  <TableCell>{v.preco}</TableCell>
                  <TableCell>{v.cidade}</TableCell>
                  <TableCell>
                      <Badge variant={v.status === "Disponível" ? "default" : "secondary"}>{v.status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm">Arquivar</Button>
                    <Button variant="ghost" size="sm">Duplicar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </LojistaAppShell>
  );
};

export default MeuEstoque;
