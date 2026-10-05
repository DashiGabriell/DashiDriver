import { useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useBroadcastNotification } from "@/hooks/dev/useBroadcastNotification";
import { AlertTriangle, Megaphone } from "lucide-react";

export default function Broadcast() {
  const [type, setType] = useState<"operational" | "critical">("operational");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const broadcast = useBroadcastNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    broadcast.mutate({
      type,
      category: "system_broadcast",
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl.trim() || undefined,
    });
  };

  const isValid = title.trim() && message.trim();

  return (
    <DevPageContainer title="Notificação em Massa">
      <div className="max-w-2xl space-y-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="text-muted-foreground">
              A notificação será enviada para <strong>todos os usuários ativos</strong> do sistema
              em tempo real via Supabase Realtime. Use com moderação.
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Tipo da Notificação</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as "operational" | "critical")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="operational" id="operational" />
                <Label htmlFor="operational" className="cursor-pointer">Operacional</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical" className="cursor-pointer text-red-400">Crítica</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novidades do Sistema - Junho 2026"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva as novidades..."
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionUrl">
              Link de ação <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="actionUrl"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="Ex: /dev/plans"
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || broadcast.isPending}
            className="w-full gap-2"
            size="lg"
          >
            {broadcast.isPending ? (
              <>Enviando...</>
            ) : (
              <><Megaphone className="h-4 w-4" /> Enviar Notificação</>
            )}
          </Button>
        </form>
      </div>
    </DevPageContainer>
  );
}
