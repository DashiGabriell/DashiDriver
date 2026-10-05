import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMobilePagamentos } from "@/hooks/mobile/useMobilePagamentos";
import { Search, Plus, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fmtBRL } from "@/lib/utils";

/**
 * Página Mobile de Pagamentos
 * 
 * Exibe lista de pagamentos com:
 * ✅ Filtro por status (todos, pendente, pago, atrasado)
 * ✅ Busca por descrição
 * ✅ Dados enriquecidos do banco (descricao, data_vencimento)
 * ✅ Realtime updates
 * ✅ Responsivo para mobile
 * 
 * Segurança:
 * ✅ Autenticação obrigatória (ProtectedRoute)
 * ✅ Filtro por company_id (RLS + aplicação)
 * ✅ Defense-in-depth implementado
 */
const MobilePagamentos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "pendente" | "pago" | "atrasado">("todos");
  
  // ✅ Fetch pagamentos from Supabase com filtro por company_id
  // Hook retorna pagamentos enriquecidos com descricao e data_vencimento
  const { pagamentos = [], loading, error } = useMobilePagamentos();

  // Filtrar pagamentos por busca e status
  const filteredPagamentos = pagamentos.filter((p: any) => {
    const matchesSearch = p.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  /**
   * Retorna cor do badge baseado no status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/10 text-green-700 border border-green-200";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700 border border-yellow-200";
      case "atrasado":
        return "bg-red-500/10 text-red-700 border border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border border-gray-200";
    }
  };

  /**
   * Retorna ícone baseado no tipo de pagamento
   */
  const getTipoIcon = (tipo: string) => {
    return tipo === "receita" ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/10 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/mobile/home")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Pagamentos</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : `${filteredPagamentos.length} pagamento(s)`}
            </p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg" onClick={() => navigate("/mobile/pagamentos/novo")}>
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-4 space-y-4 bg-background/50">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar pagamentos"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["todos", "pendente", "pago", "atrasado"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`chip px-4 py-2 rounded-lg whitespace-nowrap transition-all text-xs font-medium ${
                filterStatus === status
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              aria-pressed={filterStatus === status}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pagamentos List */}
      <div className="px-4 space-y-3 py-4">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10 text-muted-foreground">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="mt-2">Carregando pagamentos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-700 text-sm">
            <p className="font-semibold">Erro ao carregar pagamentos</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPagamentos.length === 0 && (
          <div className="text-center py-10 rounded-lg text-muted-foreground">
            <p className="font-semibold">Nenhum pagamento encontrado</p>
            <p className="text-xs mt-1">
              {searchTerm || filterStatus !== "todos"
                ? "Tente ajustar os filtros"
                : "Comece adicionando um novo pagamento"}
            </p>
          </div>
        )}

        {/* Pagamentos Cards */}
        {filteredPagamentos.map((pagamento: any) => (
          <div
            key={pagamento.id}
            onClick={() => navigate(`/mobile/pagamentos/${pagamento.id}`)}
            className="p-4 rounded-lg border border-border/50 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer bg-card"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/mobile/pagamentos/${pagamento.id}`);
              }
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                  {getTipoIcon(pagamento.tipo)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {pagamento.descricao || "Pagamento"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vencimento: {formatDate(pagamento.data_vencimento)}
                  </p>
                </div>
              </div>

              {/* Value and Status */}
              <div className="text-right flex-shrink-0 ml-2">
                <p
                  className={`font-bold text-sm ${
                    pagamento.tipo === "receita" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {pagamento.tipo === "receita" ? "+" : "-"}
                  {fmtBRL(pagamento.valor)}
                </p>
                <Badge className={`mt-1 text-xs ${getStatusColor(pagamento.status)}`}>
                  {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Card Footer - Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
              <span>Método: {pagamento.metodo || "N/A"}</span>
              <span>
                {pagamento.comprovante_url ? "✓ Com comprovante" : "Sem comprovante"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilePagamentos;
