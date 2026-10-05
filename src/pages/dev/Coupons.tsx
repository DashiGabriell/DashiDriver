import { useState, useMemo } from "react";
import { DevPageContainer } from "@/components/dev/DevPageContainer";
import { StatCard } from "@/components/dev/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { darkChartTheme } from "@/components/charts/ChartTheme";
import { Plus, Pencil, Trash2, Loader2, X, Ticket, Eye, Power, PowerOff, Users } from "lucide-react";
import {
  useCoupons,
  useCouponUsage,
  useAllCouponUsage,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  type Coupon,
  type CouponInput,
  type CouponUsage,
  type CouponUsageSummary,
} from "@/hooks/dev/useCoupons";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const PIE_COLORS = [
  darkChartTheme.colors.primary,
  darkChartTheme.colors.secondary,
  darkChartTheme.colors.success,
  darkChartTheme.colors.error,
  darkChartTheme.colors.warning,
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return currencyFormatter.format(value);
}

function discountLabel(coupon: Coupon) {
  if (coupon.discount_type === "percentual") {
    return `${coupon.discount_value}%`;
  }
  return formatCurrency(coupon.discount_value);
}

function usesLabel(coupon: Coupon) {
  const current = coupon.current_uses;
  if (coupon.max_uses === null) return `${current} / ∞`;
  return `${current} / ${coupon.max_uses}`;
}

function isExpired(coupon: Coupon) {
  if (!coupon.expires_at) return false;
  return new Date(coupon.expires_at) < new Date();
}

function statusInfo(coupon: Coupon) {
  if (!coupon.active) return { label: "Inativo", variant: "secondary" as const };
  if (isExpired(coupon)) return { label: "Expirado", variant: "destructive" as const };
  return { label: "Ativo", variant: "default" as const };
}

function lightChartTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) return darkChartTheme;
  return {
    text: "#374151",
    grid: "#E5E7EB",
    tooltip: { background: "#FFFFFF", border: "#E5E7EB", text: "#111827" },
    colors: darkChartTheme.colors,
    background: "#FFFFFF",
  };
}

function UsersCell({
  summary,
  totalUses,
}: {
  summary: CouponUsageSummary | undefined;
  totalUses: number;
}) {
  if (!summary || summary.users.length === 0) {
    return <span className="text-zinc-500 text-xs">—</span>;
  }

  const maxVisible = 2;
  const visible = summary.users.slice(0, maxVisible);
  const remaining = summary.users.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1" title={summary.users.map((u) => u.name || u.email || "?").join(", ")}>
      {visible.map((user, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 leading-tight"
        >
          <Users className="h-2.5 w-2.5 shrink-0 text-zinc-500" />
          {user.name || user.email || "—"}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-zinc-500">+{remaining}</span>
      )}
    </div>
  );
}

function NewCouponForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (input: CouponInput) => void;
  isCreating: boolean;
}) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentual" | "fixo">("percentual");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      min_amount: minAmount ? parseFloat(minAmount) : null,
      expires_at: expiresAt || null,
    });
    setCode("");
    setDescription("");
    setDiscountType("percentual");
    setDiscountValue("");
    setMaxUses("");
    setMinAmount("");
    setExpiresAt("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
    >
      <div className="min-w-[140px] flex-1">
        <label className="block text-xs text-zinc-400 mb-1">Código</label>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 uppercase"
          placeholder="CUPOM10"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />
      </div>
      <div className="min-w-[160px] flex-1">
        <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="Desconto de lançamento"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="w-28">
        <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
        <select
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as "percentual" | "fixo")}
        >
          <option value="percentual">Percentual</option>
          <option value="fixo">Fixo (R$)</option>
        </select>
      </div>
      <div className="w-24">
        <label className="block text-xs text-zinc-400 mb-1">
          {discountType === "percentual" ? "Valor (%)" : "Valor (R$)"}
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="10"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          required
        />
      </div>
      <div className="w-24">
        <label className="block text-xs text-zinc-400 mb-1">Usos máx.</label>
        <input
          type="number"
          min="1"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="Ilimitado"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
        />
      </div>
      <div className="w-28">
        <label className="block text-xs text-zinc-400 mb-1">Valor mín.</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="R$ 0"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
      </div>
      <div className="w-36">
        <label className="block text-xs text-zinc-400 mb-1">Expira em</label>
        <input
          type="date"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isCreating || !code.trim() || !discountValue}>
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        Criar
      </Button>
    </form>
  );
}

function EditCouponDialog({
  coupon,
  onSave,
  onClose,
}: {
  coupon: Coupon;
  onSave: (updates: Partial<Coupon>) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState(coupon.code);
  const [description, setDescription] = useState(coupon.description ?? "");
  const [discountType, setDiscountType] = useState(coupon.discount_type);
  const [discountValue, setDiscountValue] = useState(String(coupon.discount_value));
  const [maxUses, setMaxUses] = useState(coupon.max_uses !== null ? String(coupon.max_uses) : "");
  const [minAmount, setMinAmount] = useState(coupon.min_amount !== null ? String(coupon.min_amount) : "");
  const [expiresAt, setExpiresAt] = useState(
    coupon.expires_at ? new Date(coupon.expires_at).toISOString().split("T")[0] : "",
  );

  const handleSave = () => {
    const updates: Partial<Coupon> = {};
    if (code.trim()) updates.code = code.trim().toUpperCase();
    updates.description = description.trim() || null;
    updates.discount_type = discountType;
    updates.discount_value = parseFloat(discountValue);
    updates.max_uses = maxUses ? parseInt(maxUses, 10) : null;
    updates.min_amount = minAmount ? parseFloat(minAmount) : null;
    updates.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;
    onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Editar Cupom</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Código</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Tipo</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percentual" | "fixo")}
              >
                <option value="percentual">Percentual</option>
                <option value="fixo">Fixo (R$)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                {discountType === "percentual" ? "Valor (%)" : "Valor (R$)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Usos máx.</label>
              <input
                type="number"
                min="1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ilimitado"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Valor mínimo (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Expira em</label>
              <input
                type="date"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageModal({
  code,
  onClose,
}: {
  code: string | null;
  onClose: () => void;
}) {
  const { data: usages, isLoading } = useCouponUsage(code);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between p-6 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Usos do Cupom: <span className="text-emerald-400">{code}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p className="text-zinc-400">Carregando usos...</p>
          ) : !usages || usages.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum uso registrado para este cupom.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor Original</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usages.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.profile_name || "—"}</TableCell>
                    <TableCell className="text-zinc-400 text-xs">{u.profile_email || "—"}</TableCell>
                    <TableCell className="text-xs">{u.plan}</TableCell>
                    <TableCell className="font-mono text-xs">{formatCurrency(u.amount)}</TableCell>
                    <TableCell className="font-mono text-xs text-emerald-400">{formatCurrency(u.discount_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "APPROVED" ? "default" : "secondary"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">{formatDateTime(u.paid_at || u.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Coupons() {
  const { data: coupons, isLoading, error } = useCoupons();
  const { data: usageMap } = useAllCouponUsage();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [usageCode, setUsageCode] = useState<string | null>(null);

  const theme = useMemo(() => lightChartTheme(), []);

  const tooltipStyle = {
    backgroundColor: theme.tooltip.background,
    border: `1px solid ${theme.tooltip.border}`,
    borderRadius: 6,
    color: theme.tooltip.text,
  };

  const stats = useMemo(() => {
    if (!coupons) return { total: 0, active: 0, expired: 0, totalUses: 0 };
    const total = coupons.length;
    const active = coupons.filter((c) => c.active && !isExpired(c)).length;
    const expired = coupons.filter((c) => isExpired(c)).length;
    const totalUses = coupons.reduce((sum, c) => sum + c.current_uses, 0);
    return { total, active, expired, totalUses };
  }, [coupons]);

  const pieData = useMemo(() => {
    if (!coupons) return [];
    const percentual = coupons.filter((c) => c.discount_type === "percentual").length;
    const fixo = coupons.filter((c) => c.discount_type === "fixo").length;
    return [
      { name: "Percentual", value: percentual },
      { name: "Fixo", value: fixo },
    ].filter((d) => d.value > 0);
  }, [coupons]);

  const barData = useMemo(() => {
    if (!coupons) return [];
    return [...coupons]
      .sort((a, b) => b.current_uses - a.current_uses)
      .slice(0, 5)
      .map((c) => ({
        name: c.code,
        usos: c.current_uses,
      }));
  }, [coupons]);

  if (error) {
    return (
      <DevPageContainer title="Cupons de Desconto">
        <p className="text-red-500">
          Erro ao carregar cupons: {(error as Error).message}
        </p>
        <p className="text-zinc-400 text-sm mt-2">
          Certifique-se de que a tabela <code>coupons</code> existe no banco.
          Execute o script em{" "}
          <code>supabase/migrations/comuns/20260618210000_add_coupons.sql</code>
        </p>
      </DevPageContainer>
    );
  }

  return (
    <DevPageContainer title="Cupons de Desconto">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Cupons" value={stats.total} description="Cupons criados" />
          <StatCard title="Cupons Ativos" value={stats.active} description="Disponíveis para uso" />
          <StatCard title="Usos Totais" value={stats.totalUses} description="Vezes utilizado" />
          <StatCard title="Cupons Expirados" value={stats.expired} description="Período vencido" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Cupons por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {pieData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum cupom cadastrado.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: theme.text }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Cupons Mais Usados (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {barData.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum cupom cadastrado.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
                    <XAxis dataKey="name" stroke={theme.text} />
                    <YAxis stroke={theme.text} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="usos" name="Usos" fill={darkChartTheme.colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Form */}
        <div>
          <p className="text-zinc-400 text-sm mb-4">
            Gerencie os cupons de desconto da plataforma.
          </p>
          <NewCouponForm
            onSubmit={(input) => createMutation.mutate(input)}
            isCreating={createMutation.isPending}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="text-zinc-400">Carregando cupons...</p>
        ) : !coupons || coupons.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            Nenhum cupom cadastrado. Crie um acima.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead className="hidden lg:table-cell">Descrição</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead className="hidden lg:table-cell">Usuários</TableHead>
                <TableHead className="hidden lg:table-cell">Valor Mín.</TableHead>
                <TableHead className="hidden lg:table-cell">Expira em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = statusInfo(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <code className="text-sm font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-zinc-400 max-w-[180px] truncate">
                      {coupon.description || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {discountLabel(coupon)}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {usesLabel(coupon)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[200px]">
                      <UsersCell
                        summary={usageMap?.get(coupon.code)}
                        totalUses={coupon.current_uses}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs">
                      {formatCurrency(coupon.min_amount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-zinc-400">
                      {formatDate(coupon.expires_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-zinc-400">
                      {formatDate(coupon.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Ver usos"
                          onClick={() => setUsageCode(coupon.code)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Editar"
                          onClick={() => setEditingCoupon(coupon)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                          title={coupon.active ? "Desativar" : "Ativar"}
                          onClick={() =>
                            updateMutation.mutate({
                              id: coupon.id,
                              active: !coupon.active,
                            })
                          }
                        >
                          {coupon.active ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Excluir"
                          onClick={() => setCouponToDelete(coupon.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Usage Modal */}
        {usageCode && (
          <UsageModal code={usageCode} onClose={() => setUsageCode(null)} />
        )}

        {/* Edit Dialog */}
        {editingCoupon && (
          <EditCouponDialog
            coupon={editingCoupon}
            onSave={(updates) => {
              updateMutation.mutate({ id: editingCoupon.id, ...updates });
              setEditingCoupon(null);
            }}
            onClose={() => setEditingCoupon(null)}
          />
        )}

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!couponToDelete}
          onOpenChange={() => setCouponToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cupom?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá excluir permanentemente este cupom. As vendas já
                realizadas com este cupom não serão afetadas, mas ele não
                poderá mais ser utilizado.
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
                  if (couponToDelete) {
                    deleteMutation.mutate(couponToDelete);
                    setCouponToDelete(null);
                  }
                }}
              >
                {deleteMutation.isPending
                  ? "Excluindo..."
                  : "Sim, excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DevPageContainer>
  );
}
