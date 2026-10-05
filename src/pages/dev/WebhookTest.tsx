import { useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useWebhookFunctions, useTestWebhook, type EdgeFunction, type TestResult } from "@/hooks/dev/useWebhookTest";
import { Loader2, Play, RefreshCw, CheckCircle2, XCircle, Clock, Webhook } from "lucide-react";

const SUPABASE_URL = "https://igchaidmowxpyjapjybe.supabase.co";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-success/15 text-success hover:bg-success/20" : ""}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-success" : "bg-destructive"}`} />
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}

function TestResultPanel({ result, onClear }: { result: TestResult; onClear: () => void }) {
  const isSuccess = result.statusCode && result.statusCode < 500;
  const isUnauthorized = result.statusCode === 401;

  return (
    <Card className="p-4 space-y-3 border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive" />
          )}
          Resultado: {result.slug}
        </h4>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Status</span>
          <p className="font-semibold font-mono mt-0.5">
            {result.statusCode ? (
              <span className={result.statusCode < 300 ? "text-success" : "text-destructive"}>
                {result.statusCode}
              </span>
            ) : (
              <span className="text-destructive">Sem resposta</span>
            )}
          </p>
        </div>
        <div className="p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Tempo</span>
          <p className="font-semibold font-mono mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {result.durationMs}ms
          </p>
        </div>
        <div className="col-span-2 p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Interpretação</span>
          <p className="font-semibold mt-0.5">
            {result.error
              ? `Erro: ${result.error}`
              : isUnauthorized
                ? "Webhook respondeu (requer secret específico) — funcionando"
                : result.statusCode && result.statusCode < 300
                  ? "Webhook funcionando normalmente"
                  : `Webhook respondeu com erro (${result.statusCode})`}
          </p>
        </div>
      </div>

      {result.body && result.body !== "OK" && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Resposta:</p>
          <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto max-h-24 font-mono">
            {result.body}
          </pre>
        </div>
      )}
    </Card>
  );
}

export default function WebhookTest() {
  const { data: functions, isLoading, error, refetch } = useWebhookFunctions();
  const testWebhook = useTestWebhook();
  const { toast } = useToast();
  const [testando, setTestando] = useState<string | null>(null);
  const [ultimoTeste, setUltimoTeste] = useState<TestResult | null>(null);
  const [reativando, setReativando] = useState<string | null>(null);

  const handleTestar = async (fn: EdgeFunction) => {
    setTestando(fn.slug);
    setUltimoTeste(null);

    try {
      const result = await testWebhook(fn.slug);
      setUltimoTeste(result);
      toast({
        title: result.error ? "Falha no teste" : result.statusCode && result.statusCode < 300 ? "Webhook OK" : "Resposta inesperada",
        description: result.error || `${fn.name} respondeu com status ${result.statusCode} em ${result.durationMs}ms`,
        variant: result.error || (result.statusCode && result.statusCode >= 400) ? "destructive" : "default",
      });
    } catch (err: any) {
      toast({ title: "Erro ao testar", description: err.message, variant: "destructive" });
    } finally {
      setTestando(null);
    }
  };

  const handleReativar = async (fn: EdgeFunction) => {
    setReativando(fn.slug);

    try {
      const result = await testWebhook(fn.slug);

      if (result.statusCode && result.statusCode < 500) {
        toast({
          title: "Webhook já está respondendo",
          description: `${fn.name} respondeu com status ${result.statusCode}. Nenhuma ação necessária.`,
        });
        return;
      }

      const deployCmd = `npx supabase functions deploy ${fn.slug} --project-ref igchaidmowxpyjapjybe`;
      await navigator.clipboard.writeText(deployCmd);
      toast({
        title: "Comando copiado!",
        description: (
          <span>
            O webhook não está respondendo. O comando de deploy foi copiado para sua área de transferência.<br />
            <code className="text-xs bg-muted/30 px-1 py-0.5 rounded mt-1 block">{deployCmd}</code>
          </span>
        ) as any,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setReativando(null);
    }
  };

  return (
    <DevPageContainer title="Webhooks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Gerencie e teste os webhooks ativos no sistema.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Erro ao carregar funções: {error.message}</p>
          </div>
        ) : !functions || functions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Webhook className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nenhum webhook encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left font-semibold p-3">Nome</th>
                  <th className="text-left font-semibold p-3">Status</th>
                  <th className="text-left font-semibold p-3">Versão</th>
                  <th className="text-left font-semibold p-3 hidden md:table-cell">URL</th>
                  <th className="text-right font-semibold p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {functions.map((fn) => (
                  <tr key={fn.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{fn.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{fn.slug}</p>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={fn.status} />
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs bg-muted/30 px-2 py-1 rounded">
                        v{fn.version}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <code className="text-xs text-muted-foreground truncate block max-w-[250px]">
                        {fn.url}
                      </code>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestar(fn)}
                          disabled={testando === fn.slug}
                        >
                          {testando === fn.slug ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline ml-1.5">Testar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReativar(fn)}
                          disabled={reativando === fn.slug}
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          {reativando === fn.slug ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline ml-1.5">Reativar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ultimoTeste && (
          <TestResultPanel result={ultimoTeste} onClear={() => setUltimoTeste(null)} />
        )}

        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="font-medium mb-1">Como testar webhooks manualmente:</p>
          <code className="block text-[11px] mt-1">
            curl -X POST {SUPABASE_URL}/functions/v1/asaas-webhook \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer {'{anon_key}'}" \<br />
            &nbsp;&nbsp;-H "x-asaas-webhook-secret: {'{secret}'}" \<br />
            &nbsp;&nbsp;-d '{`{"event":"PAYMENT_CONFIRMED","payment":{"subscription":"sub_id","id":"pay_id"}}`}'
          </code>
        </div>
      </div>
    </DevPageContainer>
  );
}
