import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMobileMotoristas } from "@/hooks/mobile/useMobileMotoristas";

/**
 * Página Mobile de Motoristas — mesma camada de dados do desktop (driverService).
 */
const MobileMotoristas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { motoristas: drivers, loading, error } = useMobileMotoristas();

  const filteredMotoristas = useMemo(() => {
    return drivers.filter(
      (d) =>
        d.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.cpf?.includes(searchTerm),
    );
  }, [drivers, searchTerm]);

  /**
   * Retorna cor do badge baseado no status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500/10 text-green-700 border border-green-200";
      case "inativo":
        return "bg-gray-500/10 text-gray-700 border border-gray-200";
      case "suspenso":
        return "bg-red-500/10 text-red-700 border border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border border-gray-200";
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
            <h1 className="text-xl font-bold">Motoristas</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : `${filteredMotoristas.length} motorista(s)`}
            </p>
          </div>
        </div>
        <Button size="sm" className="rounded-lg" onClick={() => navigate("/mobile/motoristas/novo")}>
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-4 space-y-4 bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar motoristas"
          />
        </div>
      </div>

      {/* Motoristas List */}
      <div className="px-4 space-y-3 py-4">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">Carregando motoristas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-700 text-sm">
            <p className="font-semibold">Erro ao carregar motoristas</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMotoristas.length === 0 && (
          <div className="text-center py-10 rounded-lg text-muted-foreground">
            <p className="font-semibold">Nenhum motorista encontrado</p>
            <p className="text-xs mt-1">
              {searchTerm ? "Tente ajustar a busca" : "Comece adicionando um novo motorista"}
            </p>
          </div>
        )}

        {/* Motoristas Cards */}
        {filteredMotoristas.map((motorista: any) => (
          <div
            key={motorista.id}
            onClick={() => navigate(`/mobile/motoristas/${motorista.id}`)}
            className="p-4 rounded-lg border border-border/50 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer bg-card"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/mobile/motoristas/${motorista.id}`);
              }
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{motorista.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">CPF: {motorista.cpf}</p>
              </div>
              <Badge className={`ml-2 flex-shrink-0 text-xs ${getStatusColor(motorista.status)}`}>
                {motorista.status.charAt(0).toUpperCase() + motorista.status.slice(1)}
              </Badge>
            </div>

            {/* Card Content */}
            <div className="space-y-2 text-xs text-muted-foreground">
              {motorista.telefone && (
                <p>Tel: {motorista.telefone}</p>
              )}
              {motorista.categoria_cnh && (
                <p>CNH: {motorista.categoria_cnh}</p>
              )}
              {motorista.validade_cnh && (
                <p>
                  Válida até: {new Date(motorista.validade_cnh).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMotoristas;
