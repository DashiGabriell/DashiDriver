import { useState } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Car, Building2, User, Calendar, Hash, CreditCard, Circle, AlertTriangle, ShieldCheck, TrendingUp, Trash2 } from "lucide-react";
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
import { useDeleteVehicle } from "@/hooks/dev/useDeleteVehicle";

interface VehicleCompany {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  saas_plan: string;
  mkt_plan: string;
  ativo: boolean;
}

interface VehicleProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface MarketplaceRef {
  id: string;
  status: string;
  title: string;
  price: number | null;
}

interface VeiculoRow {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  status: string;
  km_atual: number;
  km_inicial: number;
  custo_mes: number;
  receita_mes: number;
  parcela: number;
  parcelas_restantes: number;
  banco: string;
  seguro: number;
  vencimento_parcela: string;
  vencimento_seguro: string;
  photo_urls: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  company_id: string;
  user_id: string | null;
  company: VehicleCompany | null;
  profile: VehicleProfile | null;
  marketplaceListings: MarketplaceRef[];
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "disponivel": return "default" as const;
    case "alugado": return "secondary" as const;
    case "oficina": return "outline" as const;
    case "bloqueado": return "destructive" as const;
    default: return "outline" as const;
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    disponivel: "Disponível",
    alugado: "Alugado",
    oficina: "Oficina",
    bloqueado: "Bloqueado",
  };
  return map[status] || status;
}

function planBadge(listings: MarketplaceRef[]) {
  const hasMarketplace = listings.some((l) => l.status === "active");
  if (hasMarketplace) return { label: "Gestão + Marketplace", variant: "default" as const };
  return { label: "Gestão", variant: "outline" as const };
}

export default function Veiculos() {
  const [selectedVehicle, setSelectedVehicle] = useState<VeiculoRow | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const deleteMutation = useDeleteVehicle();

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ["dev-veiculos"],
    queryFn: async () => {
      const [vehiclesRes, companiesRes, profilesRes, listingsRes] = await Promise.all([
        supabase.from("carcontrol_vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("carcontrol_companies").select("id, nome, cnpj, email, telefone, saas_plan, mkt_plan, ativo"),
        supabase.from("carcontrol_profiles").select("id, full_name, email, role"),
        supabase.from("marketplace_listings").select("id, vehicle_id, status, title, price").not("vehicle_id", "is", null),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (listingsRes.error) throw listingsRes.error;

      const companyMap = new Map(companiesRes.data.map((c: any) => [c.id, c]));
      const profileMap = new Map(profilesRes.data.map((p: any) => [p.id, p]));
      const listingMap = new Map<string, MarketplaceRef[]>();
      for (const l of listingsRes.data as any[]) {
        if (!listingMap.has(l.vehicle_id)) listingMap.set(l.vehicle_id, []);
        listingMap.get(l.vehicle_id)!.push({ id: l.id, status: l.status, title: l.title, price: l.price });
      }

      return vehiclesRes.data.map((v: any) => {
        const row: VeiculoRow = {
          id: v.id,
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano,
          cor: v.cor,
          status: v.status,
          km_atual: v.km_atual,
          km_inicial: v.km_inicial,
          custo_mes: v.custo_mes,
          receita_mes: v.receita_mes,
          parcela: v.parcela,
          parcelas_restantes: v.parcelas_restantes,
          banco: v.banco,
          seguro: v.seguro,
          vencimento_parcela: v.vencimento_parcela,
          vencimento_seguro: v.vencimento_seguro,
          photo_urls: v.photo_urls,
          created_at: v.created_at,
          updated_at: v.updated_at,
          company_id: v.company_id,
          user_id: v.user_id,
          company: companyMap.get(v.company_id) || null,
          profile: profileMap.get(v.user_id) || null,
          marketplaceListings: listingMap.get(v.id) || [],
        };
        return row;
      });
    },
  });

  return (
    <DevPageContainer title="Gestão de Veículos">
      {isLoading ? (
        <p>Carregando veículos...</p>
      ) : error ? (
        <p className="text-red-500">Erro ao carregar: {(error as Error).message}</p>
      ) : !vehicles || vehicles.length === 0 ? (
        <p className="text-zinc-400 text-sm">Nenhum veículo cadastrado no momento.</p>
      ) : (
        <>
          <p className="text-zinc-500 text-xs mb-4">Total: {vehicles.length} veículos</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead className="hidden lg:table-cell">Cor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Empresa</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastrado por</TableHead>
                <TableHead className="hidden lg:table-cell">Plano</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => {
                const plan = planBadge(vehicle.marketplaceListings);
                return (
                  <TableRow
                    key={vehicle.id}
                    className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <TableCell className="font-mono text-xs font-bold uppercase">{vehicle.placa}</TableCell>
                    <TableCell className="font-medium">{vehicle.marca} {vehicle.modelo}</TableCell>
                    <TableCell className="text-zinc-400">{vehicle.ano}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Circle className="w-3 h-3" style={{ fill: vehicle.cor, color: vehicle.cor }} />
                        {vehicle.cor}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(vehicle.status)}>
                        {statusLabel(vehicle.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400 text-xs max-w-[140px] truncate">
                      {vehicle.company?.nome || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400 text-xs max-w-[120px] truncate">
                      {vehicle.profile?.full_name || vehicle.profile?.email || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={plan.variant}>{plan.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400 text-xs">
                      {formatDate(vehicle.created_at)}
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Excluir veículo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete(vehicle.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between p-6 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {selectedVehicle.marca} {selectedVehicle.modelo}
                </h2>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Placa</span>
                  <p className="text-2xl font-mono font-black text-white mt-1">{selectedVehicle.placa}</p>
                </div>
                <Badge variant={statusBadgeVariant(selectedVehicle.status)} className="text-sm px-4 py-1.5">
                  {statusLabel(selectedVehicle.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Car className="w-3 h-3" /> Identificação
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Marca</span>
                      <span className="text-white font-medium">{selectedVehicle.marca}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Modelo</span>
                      <span className="text-white font-medium">{selectedVehicle.modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ano</span>
                      <span className="text-white font-medium">{selectedVehicle.ano}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Cor</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <Circle className="w-3 h-3" style={{ fill: selectedVehicle.cor, color: selectedVehicle.cor }} />
                        {selectedVehicle.cor}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Placa</span>
                      <span className="text-white font-mono font-bold">{selectedVehicle.placa}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Quilometragem
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">KM Atual</span>
                      <span className="text-white font-mono font-bold">{selectedVehicle.km_atual.toLocaleString("pt-BR")} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">KM Inicial</span>
                      <span className="text-white font-mono">{selectedVehicle.km_inicial.toLocaleString("pt-BR")} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Rodado</span>
                      <span className="text-white font-mono">{(selectedVehicle.km_atual - selectedVehicle.km_inicial).toLocaleString("pt-BR")} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Financiamento
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Banco</span>
                      <span className="text-white font-medium">{selectedVehicle.banco || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Parcela</span>
                      <span className="text-white font-mono font-bold">{currencyFormatter.format(selectedVehicle.parcela)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Restantes</span>
                      <span className="text-white font-mono">{selectedVehicle.parcelas_restantes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Vencimento</span>
                      <span className="text-white font-mono text-xs">{formatDate(selectedVehicle.vencimento_parcela)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Seguro
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Valor</span>
                      <span className="text-white font-mono font-bold">{currencyFormatter.format(selectedVehicle.seguro)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Vencimento</span>
                      <span className="text-white font-mono text-xs">{formatDate(selectedVehicle.vencimento_seguro)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Financeiro
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Custo/Mês</span>
                      <span className="text-red-400 font-mono font-bold">{currencyFormatter.format(selectedVehicle.custo_mes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Receita/Mês</span>
                      <span className="text-emerald-400 font-mono font-bold">{currencyFormatter.format(selectedVehicle.receita_mes)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-700">
                      <span className="text-zinc-400">Margem</span>
                      <span className={`font-mono font-bold ${selectedVehicle.receita_mes - selectedVehicle.custo_mes >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {currencyFormatter.format(selectedVehicle.receita_mes - selectedVehicle.custo_mes)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Datas
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Criado em</span>
                      <span className="text-white font-mono text-xs">{formatDate(selectedVehicle.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Atualizado em</span>
                      <span className="text-white font-mono text-xs">{formatDate(selectedVehicle.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Empresa
                </h3>
                {selectedVehicle.company ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nome</span>
                      <span className="text-white font-medium">{selectedVehicle.company.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">CNPJ</span>
                      <span className="text-white font-mono">{selectedVehicle.company.cnpj || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email</span>
                      <span className="text-white">{selectedVehicle.company.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Telefone</span>
                      <span className="text-white font-mono">{selectedVehicle.company.telefone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plano SaaS</span>
                      <Badge variant="outline">{selectedVehicle.company.saas_plan}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plano Mkt</span>
                      <Badge variant="outline">{selectedVehicle.company.mkt_plan}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ativa</span>
                      <Badge variant={selectedVehicle.company.ativo ? "default" : "secondary"}>
                        {selectedVehicle.company.ativo ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">Sem empresa vinculada</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Cadastrado por
                </h3>
                {selectedVehicle.profile ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nome</span>
                      <span className="text-white font-medium">{selectedVehicle.profile.full_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email</span>
                      <span className="text-white">{selectedVehicle.profile.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Role</span>
                      <Badge variant={selectedVehicle.profile.role === "dev" ? "destructive" : selectedVehicle.profile.role === "admin" ? "default" : "outline"}>
                        {selectedVehicle.profile.role || "user"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">Sem usuário vinculado</p>
                )}
              </div>

              {selectedVehicle.marketplaceListings.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 space-y-3">
                  <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Marketplaces
                  </h3>
                  <div className="space-y-2">
                    {selectedVehicle.marketplaceListings.map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-zinc-800/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-white truncate">{listing.title || "Sem título"}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {listing.price != null && (
                            <span className="text-emerald-400 font-mono font-bold">{currencyFormatter.format(listing.price)}</span>
                          )}
                          <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-[9px]">
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!vehicleToDelete}
        onOpenChange={() => setVehicleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente o veículo e
              <strong> todos os registros vinculados</strong> (manutenções,
              alertas, checklists, parcelas, anúncios no marketplace e mais).
              Esta operação não pode ser desfeita.
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
                if (vehicleToDelete) {
                  deleteMutation.mutate(vehicleToDelete);
                  setVehicleToDelete(null);
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
