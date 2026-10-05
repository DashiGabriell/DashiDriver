import { useEffect, useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400",
  resolved: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400",
  closed: "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700 dark:text-gray-400",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

interface TicketWithUser {
  id: string;
  company_id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  image_urls: string[];
  created_at: string;
  updated_at: string;
  carcontrol_profiles?: {
    email: string | null;
    full_name: string | null;
  } | null;
}

export default function Support() {
  const {
    allTickets,
    allTicketsLoading,
    fetchAllTickets,
    updateTicket,
    updatingTicket,
  } = useSupportTickets();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localTickets, setLocalTickets] = useState<TicketWithUser[]>([]);

  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  useEffect(() => {
    setLocalTickets(allTickets as unknown as TicketWithUser[]);
  }, [allTickets]);

  const filteredTickets = localTickets.filter((ticket) => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  });

  const handleStatusChange = async (
    ticketId: string,
    newStatus: "open" | "in_progress" | "resolved" | "closed"
  ) => {
    setLocalTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTicket({ id: ticketId, updates: { status: newStatus } });
    } catch {
      setLocalTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: localTickets.find((ot) => ot.id === ticketId)?.status || t.status }
            : t
        )
      );
    }
  };

  return (
    <DevPageContainer title="Central de Suporte Interno">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Filtrar por status:</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllTickets()}
            disabled={allTicketsLoading}
          >
            {allTicketsLoading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : null}
            Atualizar
          </Button>
        </div>

        {allTicketsLoading && localTickets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum ticket encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === ticket.id ? null : ticket.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] px-2 py-0.5 ${statusColors[ticket.status]}`}
                    >
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] px-2 py-0.5 ${priorityColors[ticket.priority]}`}
                    >
                      {priorityLabels[ticket.priority]}
                    </Badge>
                    <span className="font-medium text-sm truncate">
                      {ticket.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {ticket.carcontrol_profiles?.full_name ||
                        ticket.carcontrol_profiles?.email ||
                        "Desconhecido"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    {expandedId === ticket.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedId === ticket.id && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div>
                      <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    {ticket.image_urls.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Anexos ({ticket.image_urls.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.image_urls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={url}
                                alt={`Anexo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <Select
                          value={ticket.status}
                          onValueChange={(val) =>
                            handleStatusChange(
                              ticket.id,
                              val as "open" | "in_progress" | "resolved" | "closed"
                            )
                          }
                        >
                          <SelectTrigger className="w-[150px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em andamento</SelectItem>
                            <SelectItem value="resolved">Resolvido</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Prioridade:</span>
                        <Select
                          value={ticket.priority}
                          onValueChange={(val) =>
                            updateTicket({
                              id: ticket.id,
                              updates: { priority: val },
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-[10px] text-muted-foreground ml-auto">
                        Atualizado em{" "}
                        {new Date(ticket.updated_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DevPageContainer>
  );
}
