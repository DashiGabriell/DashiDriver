import { DevPageContainer } from "@/components/dev/DevPageContainer";
import {
  useEvents,
  getTipoLabel,
  getSeveridadeConfig,
  type EventItem,
} from "@/hooks/dev/useEvents";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

const TIPO_FILTERS = [
  "all",
  "pagamento",
  "seguro",
  "manutencao",
  "documento",
  "contrato",
  "ocioso",
  "sistema",
] as const;

function EventCard({ event }: { event: EventItem }) {
  const sev = getSeveridadeConfig(event.severidade);

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-zinc-900/40 border-zinc-800/50">
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className={`w-2.5 h-2.5 rounded-full ${sev.color}`} />
        <div className="w-px flex-1 bg-zinc-700" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={
              event.severidade === "critico"
                ? "destructive"
                : event.severidade === "atencao"
                  ? "secondary"
                  : "outline"
            }
            className="text-[10px] uppercase tracking-wider"
          >
            {sev.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {getTipoLabel(event.tipo)}
          </Badge>
        </div>

        <h4 className="text-sm font-medium text-white">{event.titulo}</h4>

        {event.descricao && (
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
            {event.descricao}
          </p>
        )}

        <p className="text-[10px] text-zinc-600 mt-2">
          {formatDate(event.created_at || event.data)}
        </p>
      </div>
    </div>
  );
}

export default function Events() {
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const { data: events, isLoading, error } = useEvents({ tipo: tipoFilter });

  return (
    <DevPageContainer title="Eventos em Tempo Real">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {TIPO_FILTERS.map((tipo) => (
              <button
                key={tipo}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  tipoFilter === tipo
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                }`}
                onClick={() => setTipoFilter(tipo)}
              >
                {tipo === "all"
                  ? "Todos"
                  : getTipoLabel(tipo)}
              </button>
            ))}
          </div>

          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" />
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : error ? (
          <p className="text-red-500">
            Erro ao carregar eventos: {(error as Error).message}
          </p>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-sm">
              Nenhum evento encontrado.
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Novos eventos aparecerão aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </DevPageContainer>
  );
}
