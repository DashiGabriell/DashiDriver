import { useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useImpersonate } from "@/hooks/dev/useImpersonate";
import { X, User, Building2, Mail, Shield, Calendar, Clock, Truck, LogIn } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type Role = "user" | "admin" | "dev";

interface CompanyInfo {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  saas_plan: string;
  mkt_plan: string;
  ativo: boolean;
}

interface UserWithCompany {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role | null;
  created_at: string | null;
  updated_at: string | null;
  avatar_url: string | null;
  company: CompanyInfo | null;
  vehicleCount?: number;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function roleVariant(role: Role | null) {
  if (role === "dev") return "destructive" as const;
  if (role === "admin") return "default" as const;
  return "outline" as const;
}

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<UserWithCompany | null>(null);
  const { impersonate, loading: impersonateLoading } = useImpersonate();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["dev-users-full"],
    queryFn: async () => {
      const [profilesRes, companiesRes, vehiclesCountRes] = await Promise.all([
        supabase
          .from("carcontrol_profiles")
          .select("id, email, full_name, role, created_at, updated_at, avatar_url, company_id")
          .order("created_at", { ascending: false }),
        supabase
          .from("carcontrol_companies")
          .select("id, nome, cnpj, email, telefone, saas_plan, mkt_plan, ativo"),
        supabase
          .from("carcontrol_vehicles")
          .select("user_id, id", { count: "exact", head: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (vehiclesCountRes.error) throw vehiclesCountRes.error;

      const companyMap = new Map(companiesRes.data.map((c) => [c.id, c]));
      const vehicleCountMap = new Map<string, number>();
      for (const v of vehiclesCountRes.data ?? []) {
        const uid = (v as any).user_id;
        if (uid) vehicleCountMap.set(uid, (vehicleCountMap.get(uid) || 0) + 1);
      }

      return (profilesRes.data ?? []).map((row) => {
        const cid = (row as any).company_id as string | null;
        return {
          id: row.id,
          email: row.email,
          full_name: row.full_name,
          role: row.role as Role | null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          avatar_url: row.avatar_url,
          company: cid ? (companyMap.get(cid) ?? null) : null,
          vehicleCount: vehicleCountMap.get(row.id) || 0,
        };
      });
    },
  });

  return (
    <DevPageContainer title="Gestão Global de Usuários">
      {isLoading ? (
        <p>Carregando usuários...</p>
      ) : error ? (
        <p className="text-red-500">Erro ao carregar: {(error as Error).message}</p>
      ) : !users || users.length === 0 ? (
        <p className="text-zinc-400 text-sm">Nenhum usuário cadastrado no momento.</p>
      ) : (
        <>
          <p className="text-zinc-500 text-xs mb-4">Total: {users.length} usuários</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell className="font-medium">
                    {user.full_name || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {user.email || "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400 max-w-[160px] truncate">
                    {user.company?.nome || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(user.role)}>
                      {user.role || "user"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-xs">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between p-6 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {selectedUser.full_name || "Usuário"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedUser.full_name || "Sem nome"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={roleVariant(selectedUser.role)}>
                      {selectedUser.role || "user"}
                    </Badge>
                    <span className="text-zinc-500 text-xs">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <p className="text-sm text-white font-medium break-all">{selectedUser.email || "—"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Role
                  </span>
                  <div>
                    <Badge variant={roleVariant(selectedUser.role)}>
                      {selectedUser.role || "user"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Criado em
                  </span>
                  <p className="text-sm text-white font-mono">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Atualizado em
                  </span>
                  <p className="text-sm text-white font-mono">{formatDate(selectedUser.updated_at)}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="w-3 h-3" /> Veículos
                </span>
                <p className="text-2xl font-black text-white">{selectedUser.vehicleCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Empresa
                </h3>
                {selectedUser.company ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nome</span>
                      <span className="text-white font-medium">{selectedUser.company.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">CNPJ</span>
                      <span className="text-white font-mono">{selectedUser.company.cnpj || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email</span>
                      <span className="text-white">{selectedUser.company.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Telefone</span>
                      <span className="text-white font-mono">{selectedUser.company.telefone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plano SaaS</span>
                      <Badge variant="outline">{selectedUser.company.saas_plan}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plano Mkt</span>
                      <Badge variant="outline">{selectedUser.company.mkt_plan}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ativa</span>
                      <Badge variant={selectedUser.company.ativo ? "default" : "secondary"}>
                        {selectedUser.company.ativo ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">Usuário sem empresa vinculada</p>
                )}
              </div>

              <Button
                variant="default"
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => impersonate(selectedUser.id)}
                disabled={impersonateLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {impersonateLoading ? 'Personificando...' : 'Personificar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DevPageContainer>
  );
}
