import { useState } from "react";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/components/dev/StatCard";
import { useBillingOverview, deletePayment, type RecentPayment } from "@/hooks/dev/useBillingOverview";
import { useQueryClient } from "@tanstack/react-query";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type StatusVariant = "default" | "destructive" | "secondary" | "outline";

function statusVariant(status: string): StatusVariant {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

function PlanDistributionCard({
  title,
  distribution,
}: {
  title: string;
  distribution: Record<string, number>;
}) {
  const total = Object.values(distribution).reduce((acc, value) => acc + value, 0);

  return (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">Plano</TableHead>
              <TableHead className="text-muted-foreground text-right">Empresas</TableHead>
              <TableHead className="text-muted-foreground text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(distribution).map(([plan, count]) => {
              const percent = total === 0 ? 0 : Math.round((count / total) * 100);
              return (
                <TableRow key={plan}>
                  <TableCell className="font-medium">{plan}</TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{percent}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}



const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  PENDING: "Pendente",
};

const PER_PAGE = 20;

function PaymentsTable({
  payments,
  onDelete,
  deleting,
}: {
  payments: RecentPayment[];
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(payments.length / PER_PAGE);
  const start = page * PER_PAGE;
  const paginated = payments.slice(start, start + PER_PAGE);

  if (payments.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum pagamento registrado até o momento.</p>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground">Data</TableHead>
            <TableHead className="text-muted-foreground">Valor</TableHead>
            <TableHead className="text-muted-foreground">Plano</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{dateFormatter.format(new Date(payment.data))}</TableCell>
              <TableCell>{currencyFormatter.format(payment.valor ?? 0)}</TableCell>
              <TableCell className="capitalize">{payment.metodo || "—"}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(payment.status)}>{STATUS_LABEL[payment.status] ?? payment.status}</Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={deleting === payment.id}
                  onClick={() => onDelete(payment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {start + 1}–{Math.min(start + PER_PAGE, payments.length)} de {payments.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useBillingOverview();
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;
    const id = paymentToDelete;
    try {
      await deletePayment(id);
      queryClient.invalidateQueries({ queryKey: ["billing-overview"] });
    } catch (err) {
      alert("Erro ao excluir: " + (err as Error).message);
    } finally {
      setPaymentToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Controle Financeiro SaaS</h2>
        <p className="text-muted-foreground">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Controle Financeiro SaaS</h2>
        <p className="text-destructive">Erro ao carregar: {(error as Error).message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Controle Financeiro SaaS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="MRR"
          value={currencyFormatter.format(data.monthlyRecurringRevenue)}
          description="Soma dos planos ativos"
        />
        <StatCard
          title="Empresas Ativas"
          value={data.activeCompanies}
          description={`${data.inactiveCompanies} inativas`}
        />
        <StatCard
          title="Receita do Mês"
          value={currencyFormatter.format(data.revenueThisMonth)}
          description="Pagamentos confirmados"
        />
        <StatCard
          title="Inadimplência"
          value={currencyFormatter.format(data.overdueAmount)}
          description={`${data.overdueCount} pagamentos atrasados`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanDistributionCard title="Distribuição SaaS" distribution={data.bySaasPlan} />
        <PlanDistributionCard title="Distribuição Marketplace" distribution={data.byMktPlan} />
      </div>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={data.recentPayments} onDelete={setPaymentToDelete} deleting={paymentToDelete} />
        </CardContent>
      </Card>

      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente este registro de pagamento do sistema. Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={false}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
