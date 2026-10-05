// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Wrench, Calendar, DollarSign, Gauge, MapPin, FileText, Loader2, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";

/**
 * Página Mobile de Detalhes da Manutenção
 * 
 * Exibe informações completas de uma manutenção específica:
 * ✅ Dados da manutenção (tipo, serviço, oficina, data)
 * ✅ Informações do veículo
 * ✅ Custos e KM
 * ✅ Observações
 * ✅ Ações (editar, deletar)
 */
const MobileManutencaoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  // ✅ Fetch manutenção específica usando useRealtimeData com filtro
  const { data: manutencoes, loading: loadingManutencao } = useRealtimeData(
    "carcontrol_maintenances",
    { filter: (q) => q.eq("id", id!) }
  );

  const manutencao = manutencoes[0] || null;

  // ✅ Fetch veículo vinculado
  const [veiculo, setVeiculo] = useState<any>(null);
  const [loadingVeiculo, setLoadingVeiculo] = useState(false);

  useEffect(() => {
    if (!manutencao?.vehicle_id) {
      setVeiculo(null);
      return;
    }

    let cancelled = false;
    setLoadingVeiculo(true);

    (async () => {
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("*")
        .eq("id", manutencao.vehicle_id)
        .single();

      if (!cancelled) {
        if (!error && data) {
          setVeiculo(data);
        }
        setLoadingVeiculo(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [manutencao?.vehicle_id]);

  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = loadingManutencao || loadingVeiculo;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return "bg-green-500/10 text-green-700 border border-green-200";
      case "corretiva":
        return "bg-yellow-500/10 text-yellow-700 border border-yellow-200";
      case "emergencial":
        return "bg-red-500/10 text-red-700 border border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border border-gray-200";
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a manutenção "${manutencao?.servico}"?`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("carcontrol_maintenances")
        .delete()
        .eq("id", id!);

      if (error) throw error;
      toast.success("Manutenção excluída com sucesso");
      navigate("/mobile/manutencao");
    } catch (error: any) {
      toast.error("Erro ao excluir manutenção: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
          <button
            onClick={() => navigate("/mobile/manutencao")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!manutencao) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
          <button
            onClick={() => navigate("/mobile/manutencao")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Manutenção não encontrada</p>
          <Button onClick={() => navigate("/mobile/manutencao")} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/10 bg-background sticky top-0 z-10">
        <button
          onClick={() => navigate("/mobile/manutencao")}
          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 ml-3 truncate">{manutencao.servico}</h1>
        <Badge className={`flex-shrink-0 text-xs ${getTipoColor(manutencao.tipo)}`}>
          {manutencao.tipo.charAt(0).toUpperCase() + manutencao.tipo.slice(1)}
        </Badge>
      </div>

      {/* Main Info Section */}
      <div className="px-4 py-6 space-y-4">
        {/* Service Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-orange-500/10">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg">{manutencao.servico}</h2>
            {manutencao.oficina && (
              <p className="text-sm text-muted-foreground mt-1">Oficina: {manutencao.oficina}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/mobile/manutencao/${id}/editar`)}
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>

      {/* Maintenance Details */}
      <div className="px-4 py-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detalhes da Manutenção</h3>
        <div className="space-y-3">
          {manutencao.data && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data</span>
              </div>
              <span className="font-semibold text-sm">{fmtDate(manutencao.data)}</span>
            </div>
          )}
          {manutencao.valor && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valor</span>
              </div>
              <span className="font-semibold text-sm text-primary">{fmtBRL(manutencao.valor)}</span>
            </div>
          )}
          {manutencao.km_atual && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">KM Atual</span>
              </div>
              <span className="font-semibold text-sm">{manutencao.km_atual.toLocaleString("pt-BR")} km</span>
            </div>
          )}
          {manutencao.proximo_km && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Próximo KM</span>
              </div>
              <span className="font-semibold text-sm">{manutencao.proximo_km.toLocaleString("pt-BR")} km</span>
            </div>
          )}
          {manutencao.oficina && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Oficina</span>
              </div>
              <span className="font-semibold text-sm">{manutencao.oficina}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Information */}
      {veiculo && (
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Veículo</h3>
          <div className="p-4 rounded-lg border border-border/50 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Modelo</span>
              <span className="font-semibold text-sm">{veiculo.modelo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Marca</span>
              <span className="font-semibold text-sm">{veiculo.marca}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Placa</span>
              <span className="font-mono font-semibold text-sm text-primary">{veiculo.placa}</span>
            </div>
            {veiculo.ano && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ano</span>
                <span className="font-semibold text-sm">{veiculo.ano}</span>
              </div>
            )}
            {veiculo.km_atual && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">KM Atual</span>
                <span className="font-semibold text-sm">{veiculo.km_atual.toLocaleString("pt-BR")} km</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observations */}
      {manutencao.observacoes && (
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Observações</h3>
          <div className="p-4 rounded-lg border border-border/50 bg-card">
            <p className="text-sm leading-relaxed">{manutencao.observacoes}</p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="px-4 py-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Informações Adicionais</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
            <span className="text-sm text-muted-foreground">Tipo de Manutenção</span>
            <Badge className={`text-xs ${getTipoColor(manutencao.tipo)}`}>
              {manutencao.tipo.charAt(0).toUpperCase() + manutencao.tipo.slice(1)}
            </Badge>
          </div>
          {manutencao.created_at && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <span className="text-sm text-muted-foreground">Registrado em</span>
              <span className="text-xs text-muted-foreground">{fmtDate(manutencao.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="px-4 py-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate("/mobile/manutencao")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Manutenção
        </Button>
      </div>
    </div>
  );
};

export default MobileManutencaoDetalhe;
