import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Loader2, Paperclip, X, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-200",
  resolved: "bg-green-500/10 text-green-600 border-green-200",
  closed: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function Suporte() {
  const {
    userTickets,
    userTicketsLoading,
    createTicket,
    creatingTicket,
  } = useSupportTickets();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Informe o assunto do ticket");
      return;
    }
    if (!message.trim()) {
      toast.error("Descreva o problema");
      return;
    }

    try {
      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        files: files.length > 0 ? files : undefined,
      });
      toast.success("Ticket enviado com sucesso!");
      setSubject("");
      setMessage("");
      setFiles([]);
    } catch (err) {
      toast.error("Erro ao enviar ticket. Tente novamente.");
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Suporte"
        subtitle="Abra um chamado ou acompanhe seus tickets existentes"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Abrir novo ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Assunto</label>
                  <Input
                    placeholder="Ex: Problema com checklist"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Descrição do problema</label>
                  <Textarea
                    placeholder="Descreva detalhadamente o que está acontecendo..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Anexos</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm"
                      >
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Adicionar anexos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <Button type="submit" disabled={creatingTicket} className="w-full sm:w-auto">
                  {creatingTicket ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meus tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {userTicketsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : userTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Nenhum ticket ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {userTickets.map((ticket) => (
                    <div key={ticket.id} className="neu-sm p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{ticket.subject}</span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-2 py-0.5 ${statusColors[ticket.status]}`}
                        >
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {ticket.image_urls.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {ticket.image_urls.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
