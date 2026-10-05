import { LojistaAppShell } from "@/components/lojista/LojistaAppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Configuracoes = () => {
  return (
    <LojistaAppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="neu">
            <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email</Label>
                <Switch />
              </div>
            </CardContent>
          </Card>
          
          <Card className="neu">
            <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Alterar Senha</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="neu">
          <CardHeader><CardTitle>Privacidade</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Perfil Público</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="neu">
          <CardHeader><CardTitle className="text-destructive">Zona de Perigo</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive">Excluir Conta</Button>
          </CardContent>
        </Card>
      </div>
    </LojistaAppShell>
  );
};

export default Configuracoes;
