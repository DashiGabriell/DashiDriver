import { DevPageContainer } from "@/components/dev/DevPageContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useCompaniesWithPlans,
  useUpdateSaasPlan,
  useUpdateMktPlan,
  useToggleCompanyActive,
  SAAS_PLANS,
  MKT_PLANS,
  type CompanyWithOwner,
} from "@/hooks/dev/usePlanManager";
import { X } from "lucide-react";
import { useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function PlanBadge({ plan, active }: { plan: string; active: boolean }) {
  const variant =
    !active
      ? "secondary"
      : plan === "MASTER" || plan === "ELITE"
        ? "default"
        : plan === "PRO"
          ? "default"
          : "outline";

  return <Badge variant={variant}>{plan}</Badge>;
}

function StatusToggleCell({
  ativo,
  onToggle,
}: {
  ativo: boolean;
  onToggle: (novo: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="cursor-pointer hover:opacity-80"
        onClick={() => setOpen(true)}
      >
        <Badge variant={ativo ? "default" : "secondary"}>
          {ativo ? "Ativa" : "Inativa"}
        </Badge>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        className="text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-zinc-700 transition-colors data-[active=true]:bg-emerald-700 data-[active=true]:border-emerald-500"
        data-active={ativo || undefined}
        onClick={() => {
          if (!ativo) onToggle(true);
          setOpen(false);
        }}
      >
        Ativar
      </button>
      <button
        className="text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-zinc-700 transition-colors data-[active=true]:bg-red-700 data-[active=true]:border-red-500"
        data-active={!ativo || undefined}
        onClick={() => {
          if (ativo) onToggle(false);
          setOpen(false);
        }}
      >
        Desativar
      </button>
      <button
        className="text-zinc-500 hover:text-zinc-300 ml-1"
        onClick={() => setOpen(false)}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function SaasPlanCell({
  company,
  onUpdate,
}: {
  company: CompanyWithOwner;
  onUpdate: (plan: CompanyWithOwner["saas_plan"]) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
        onClick={() => setOpen(true)}
      >
        <PlanBadge plan={company.saas_plan} active={company.ativo} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {SAAS_PLANS.map((plan) => (
        <button
          key={plan}
          className="text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-zinc-700 transition-colors data-[active=true]:bg-emerald-700 data-[active=true]:border-emerald-500"
          data-active={company.saas_plan === plan || undefined}
          onClick={() => {
            onUpdate(plan);
            setOpen(false);
          }}
        >
          {plan}
        </button>
      ))}
      <button
        className="text-zinc-500 hover:text-zinc-300 ml-1"
        onClick={() => setOpen(false)}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function MktPlanCell({
  company,
  onUpdate,
}: {
  company: CompanyWithOwner;
  onUpdate: (plan: CompanyWithOwner["mkt_plan"]) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
        onClick={() => setOpen(true)}
      >
        <PlanBadge plan={company.mkt_plan} active={company.ativo} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {MKT_PLANS.map((plan) => (
        <button
          key={plan}
          className="text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-zinc-700 transition-colors data-[active=true]:bg-emerald-700 data-[active=true]:border-emerald-500"
          data-active={company.mkt_plan === plan || undefined}
          onClick={() => {
            onUpdate(plan);
            setOpen(false);
          }}
        >
          {plan}
        </button>
      ))}
      <button
        className="text-zinc-500 hover:text-zinc-300 ml-1"
        onClick={() => setOpen(false)}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function PlanManager() {
  const { data: companies, isLoading, error } = useCompaniesWithPlans();
  const updateSaas = useUpdateSaasPlan();
  const updateMkt = useUpdateMktPlan();
  const toggleActive = useToggleCompanyActive();

  const isMutating = updateSaas.isPending || updateMkt.isPending || toggleActive.isPending;

  const handleSaasUpdate = (companyId: string, plan: CompanyWithOwner["saas_plan"]) => {
    updateSaas.mutate({ companyId, plan });
  };

  const handleMktUpdate = (companyId: string, plan: CompanyWithOwner["mkt_plan"]) => {
    updateMkt.mutate({ companyId, plan });
  };

  return (
    <DevPageContainer title="Gerenciador de Planos">
      {isLoading ? (
        <p>Carregando empresas...</p>
      ) : error ? (
        <p className="text-red-500">
          Erro ao carregar: {(error as Error).message}
        </p>
      ) : !companies || companies.length === 0 ? (
        <p className="text-zinc-400 text-sm">
          Nenhuma empresa cadastrada no momento.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano SaaS</TableHead>
                <TableHead>Plano Marketplace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company.id}
                  className={!company.ativo ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">
                    {company.nome}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {company.owner_name || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {company.email || "—"}
                  </TableCell>
                  <TableCell>
                    {isMutating ? (
                      <PlanBadge
                        plan={company.saas_plan}
                        active={company.ativo}
                      />
                    ) : (
                      <SaasPlanCell
                        company={company}
                        onUpdate={(plan) => handleSaasUpdate(company.id, plan)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isMutating ? (
                      <PlanBadge
                        plan={company.mkt_plan}
                        active={company.ativo}
                      />
                    ) : (
                      <MktPlanCell
                        company={company}
                        onUpdate={(plan) => handleMktUpdate(company.id, plan)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusToggleCell
                      ativo={company.ativo}
                      onToggle={(novo) =>
                        toggleActive.mutate({
                          companyId: company.id,
                          ativo: novo,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-zinc-400 text-xs">
                    {formatDate(company.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DevPageContainer>
  );
}
