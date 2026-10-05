import { StatCard } from "@/components/dev/StatCard";
import { usePlatformOverview, type SystemStatus } from "@/hooks/dev/usePlatformOverview";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

function statusColor(status: SystemStatus) {
  if (status === "online") return "text-emerald-400";
  if (status === "degraded") return "text-amber-400";
  return "text-red-400";
}

function statusLabel(status: SystemStatus) {
  if (status === "online") return "Online";
  if (status === "degraded") return "Degradado";
  return "Offline";
}

export default function Overview() {
  const { data, isLoading, error } = usePlatformOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Overview da Plataforma</h2>
        <p className="text-muted-foreground">Carregando dados da plataforma...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Overview da Plataforma</h2>
        <p className="text-red-400">Erro ao carregar: {(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overview da Plataforma</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Empresas"
          value={data.empresas}
          description={`${data.empresasAtivas} ativas`}
        />
        <StatCard title="Usuários" value={data.usuarios} />
        <StatCard title="Veículos" value={data.veiculos} />
        <StatCard title="Motoristas" value={data.motoristas} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(data.receitaMes)}
          description="Pagamentos confirmados"
        />
        <StatCard
          title="Pagamentos Atrasados"
          value={data.pagamentosAtrasados}
        />
        <StatCard
          title="Status do Sistema"
          value={statusLabel(data.systemStatus)}
          description={`Sync: ${formatDateTime(data.lastSyncAt)}`}
        />
        <StatCard
          title="Eventos Recentes"
          value={data.recentActivity.length}
          description="Últimas movimentações"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Técnico</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Supabase:{" "}
              <span className={statusColor(data.systemStatus)}>
                {statusLabel(data.systemStatus)}
              </span>
            </p>
            <p>
              Empresas:{" "}
              <span className="text-emerald-400">
                {data.empresas} cadastradas ({data.empresasAtivas} ativas)
              </span>
            </p>
            <p>
              Usuários:{" "}
              <span className="text-emerald-400">
                {data.usuarios} perfis
              </span>
            </p>
            <p>
              Pagamentos atrasados:{" "}
              <span
                className={
                  data.pagamentosAtrasados > 0
                    ? "text-amber-400"
                    : "text-emerald-400"
                }
              >
                {data.pagamentosAtrasados}
              </span>
            </p>
            <p>
              Última sincronização:{" "}
              <span className="text-muted-foreground">
                {formatDateTime(data.lastSyncAt)}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Feed em Tempo Real</h3>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma atividade recente registrada.</p>
          ) : (
            <div className="space-y-2 text-xs text-muted-foreground font-mono">
              {data.recentActivity.map((activity, index) => (
                <p key={`${activity.type}-${activity.timestamp}-${index}`}>
                  [{formatDateTime(activity.timestamp)}] {activity.message}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
