import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Assinatura = () => {
  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>
        
        <Card className="neu">
          <CardHeader><CardTitle>Plano Atual: Lojista Pro</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Data de renovação: 30/06/2026</p>
            <div className="flex gap-4">
              <Button>Gerenciar Assinatura</Button>
              <Button variant="outline">Fazer Upgrade</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { nome: "Lojista Free", desc: "Acesso básico" },
            { nome: "Lojista Pro", desc: "Acesso completo" },
            { nome: "Lojista Elite", desc: "Suporte prioritário" }
          ].map((plano) => (
            <Card key={plano.nome} className="neu flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">{plano.nome}</h3>
                <p className="text-sm text-muted-foreground">{plano.desc}</p>
                <Button className="w-full" variant={plano.nome === "Lojista Pro" ? "default" : "outline"}>
                  {plano.nome === "Lojista Pro" ? "Plano Atual" : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LojistaAppShell>
  );
};

export default Assinatura;
