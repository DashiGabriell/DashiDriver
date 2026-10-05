import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMobileManutencao } from "@/hooks/mobile/useMobileManutencao";
import { Search, Plus, ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fmtBRL } from "@/lib/utils";

const MobileManutencao = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "preventiva" | "corretiva" | "emergencial">("todos");
  
  // ✅ Fetch manutenções from Supabase com filtro por user_id
  const { manutencoes = [], loading, error } = useMobileManutencao();

  const filteredManutencoes = manutencoes.filter((m: any) => {
    const matchesSearch = m.servico?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || m.tipo === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return "bg-green-500/10 text-green-700";
      case "corretiva":
        return "bg-red-500/10 text-red-700";
      case "emergencial":
        return "bg-orange-500/10 text-orange-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return "bg-green-500/10 text-green-700";
      case "corretiva":
        return "bg-red-500/10 text-red-700";
      case "revisao":
        return "bg-blue-500/10 text-blue-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/mobile/home")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Manutenção</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : `${filteredManutencoes.length} manutenção(ões)`}
            </p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg" onClick={() => navigate("/mobile/manutencao/novo")}>
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar manutenção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["todos", "preventiva", "corretiva", "emergencial"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterStatus(tipo as any)}
              className={`chip px-4 py-2 rounded-lg whitespace-nowrap transition-all text-xs font-medium ${
                filterStatus === tipo
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tipo === "todos" ? "Todos" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Manutenções List */}
      <div className="px-4 space-y-3">
        {loading && (
          <div className="text-center py-10 text-muted-foreground">Carregando manutenções...</div>
        )}
        {error && (
          <div className="text-danger p-4 neu bg-danger/5 rounded-lg">
            Erro ao carregar manutenções.
          </div>
        )}
        {!loading && filteredManutencoes.length === 0 && (
          <div className="text-center py-10 neu rounded-lg text-muted-foreground">
            Nenhuma manutenção encontrada.
          </div>
        )}
        {filteredManutencoes.map((manutencao: any) => (
          <div
            key={manutencao.id}
            onClick={() => navigate(`/mobile/manutencao/${manutencao.id}`)}
            className="neu p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-muted">
                  <Wrench className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{manutencao.servico}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Data: {new Date(manutencao.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(manutencao.tipo)}>
                  {manutencao.tipo}
                </Badge>
                {manutencao.valor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {manutencao.valor.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            {manutencao.oficina && (
              <p className="text-xs text-muted-foreground">
                Oficina: {manutencao.oficina}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileManutencao;
