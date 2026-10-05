import { useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Power, PowerOff } from "lucide-react";
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
import { useDeleteCompany } from "@/hooks/dev/useDeleteCompany";
import { useToggleCompanyStatus } from "@/hooks/dev/useToggleCompanyStatus";

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

export default function Companies() {
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["dev-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_companies")
        .select("id, nome, cnpj, email, telefone, endereco, saas_plan, mkt_plan, ativo, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
  const deleteMutation = useDeleteCompany();
  const toggleMutation = useToggleCompanyStatus();

  return (
    <DevPageContainer title="Gestão de Empresas">
      {isLoading ? (
        <p>Carregando empresas...</p>
      ) : error ? (
        <p className="text-red-500">Erro ao carregar: {(error as Error).message}</p>
      ) : !companies || companies.length === 0 ? (
        <p className="text-zinc-400 text-sm">Nenhuma empresa cadastrada no momento.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden lg:table-cell">Telefone</TableHead>
              <TableHead className="hidden lg:table-cell">SaaS Plan</TableHead>
              <TableHead className="hidden lg:table-cell">Mkt Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Criada em</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.nome}</TableCell>
                <TableCell className="font-mono text-xs">
                  {company.cnpj || "—"}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {company.email || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-zinc-400">
                  {company.telefone || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{company.saas_plan}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{company.mkt_plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={company.ativo ? "default" : "secondary"}>
                    {company.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-zinc-400 text-xs">
                  {formatDate(company.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className={`transition-colors ${
                        company.ativo
                          ? "text-green-500 hover:text-zinc-400"
                          : "text-zinc-500 hover:text-green-400"
                      }`}
                      title={company.ativo ? "Desativar empresa" : "Ativar empresa"}
                      disabled={toggleMutation.isPending}
                      onClick={() =>
                        toggleMutation.mutate({
                          companyId: company.id,
                          ativo: !company.ativo,
                        })
                      }
                    >
                      {company.ativo ? (
                        <Power className="h-4 w-4" />
                      ) : (
                        <PowerOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      title="Excluir empresa"
                      onClick={() => setCompanyToDelete(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AlertDialog
        open={!!companyToDelete}
        onOpenChange={() => setCompanyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente a empresa e
              <strong> todos os dados vinculados</strong> (perfis, veículos,
              motoristas, pagamentos, alertas, manutenções, checklists,
              anúncios e mais). Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (companyToDelete) {
                  deleteMutation.mutate(companyToDelete);
                  setCompanyToDelete(null);
                }
              }}
            >
              {deleteMutation.isPending
                ? "Excluindo..."
                : "Sim, excluir tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DevPageContainer>
  );
}
