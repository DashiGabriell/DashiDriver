// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Mail, Calendar, FileText, Loader2, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { fmtBRL, fmtDate } from "@/lib/utils";

/**
 * Página Mobile de Detalhes do Motorista
 * 
 * Exibe informações completas de um motorista específico:
 * ✅ Dados pessoais (nome, CPF, CNH, telefone, email)
 * ✅ Informações de trabalho (status, data de início, valor semanal)
 * ✅ Veículo vinculado
 * ✅ Histórico de pagamentos recentes
 * ✅ Ações rápidas (ligar, WhatsApp, email)
 */
const MobileMotoristaDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Fetch motorista específico usando useRealtimeData com filtro
  const { data: drivers, loading: loadingDriver } = useRealtimeData(
    "carcontrol_drivers",
    { filter: (q) => q.eq("id", id!) }
  );

  const motorista = drivers[0] || null;

  // ✅ Fetch veículo vinculado
  const [veiculo, setVeiculo] = useState<any>(null);
  const [loadingVeiculo, setLoadingVeiculo] = useState(false);

  useEffect(() => {
    if (!motorista?.veiculo_id) {
      setVeiculo(null);
      return;
    }

    let cancelled = false;
    setLoadingVeiculo(true);

    (async () => {
      const { data, error } = await supabase
        .from("carcontrol_vehicles")
        .select("*")
        .eq("id", motorista.veiculo_id)
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
  }, [motorista?.veiculo_id]);

  // ✅ Fetch pagamentos recentes do motorista
  const { data: pagamentos, loading: loadingPagamentos } = useRealtimeData(
    "carcontrol_payments",
    {
      filter: (q) => q.eq("driver_id", id!),
      order: { column: "data", ascending: false },
    }
  );

  const pagamentosRecentes = useMemo(() => {
    return pagamentos.slice(0, 5);
  }, [pagamentos]);

  const totalRecebido = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const totalPago = pagamentos
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);
  const totalPendente = pagamentos
    .filter((p) => p.status !== "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const isLoading = loadingDriver || loadingVeiculo || loadingPagamentos;

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
          <button
            onClick={() => navigate("/mobile/motoristas")}
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

  if (!motorista) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/10">
          <button
            onClick={() => navigate("/mobile/motoristas")}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">Motorista não encontrado</p>
          <Button onClick={() => navigate("/mobile/motoristas")} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/10 text-green-700";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700";
      case "atrasado":
        return "bg-red-500/10 text-red-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const initials = motorista.nome
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/10 bg-background sticky top-0 z-10">
        <button
          onClick={() => navigate("/mobile/motoristas")}
          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 ml-3 truncate">{motorista.nome}</h1>
        <Badge className={`flex-shrink-0 text-xs ${getStatusColor(motorista.status)}`}>
          {motorista.status.charAt(0).toUpperCase() + motorista.status.slice(1)}
        </Badge>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-6 space-y-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-start gap-4">
          {motorista.foto_url ? (
            <img
              src={motorista.foto_url}
              alt={motorista.nome}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary ring-2 ring-primary/20">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg">{motorista.nome}</h2>
            <p className="text-xs text-muted-foreground mt-1">CPF: {motorista.cpf}</p>
            {motorista.email && (
              <p className="text-xs text-muted-foreground mt-1">Email: {motorista.email}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {motorista.telefone && (
            <button
              onClick={() => window.location.href = `tel:${motorista.telefone}`}
              className="p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors flex flex-col items-center gap-2"
              aria-label="Ligar"
            >
              <Phone className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-medium">Ligar</span>
            </button>
          )}
          {motorista.telefone && (
            <button
              onClick={() => window.location.href = `https://wa.me/${motorista.telefone.replace(/\D/g, '')}`}
              className="p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors flex flex-col items-center gap-2"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
          )}
          {motorista.email && (
            <button
              onClick={() => window.location.href = `mailto:${motorista.email}`}
              className="p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors flex flex-col items-center gap-2"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-medium">Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="px-4 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Financeiro</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-border/50 bg-card">
            <p className="text-xs text-muted-foreground">Total Recebido</p>
            <p className="text-sm font-bold text-primary mt-1">{fmtBRL(totalRecebido)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card">
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="text-sm font-bold text-green-600 mt-1">{fmtBRL(totalPago)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card">
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="text-sm font-bold text-yellow-600 mt-1">{fmtBRL(totalPendente)}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="px-4 py-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Informações Pessoais</h3>
        <div className="space-y-3">
          {motorista.cnh && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <span className="text-sm text-muted-foreground">CNH</span>
              <span className="font-mono font-semibold text-sm">{motorista.cnh}</span>
            </div>
          )}
          {motorista.categoria_cnh && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <span className="text-sm text-muted-foreground">Categoria CNH</span>
              <span className="font-semibold text-sm">{motorista.categoria_cnh}</span>
            </div>
          )}
          {motorista.validade_cnh && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <span className="text-sm text-muted-foreground">Válida até</span>
              <span className="font-semibold text-sm">{fmtDate(motorista.validade_cnh)}</span>
            </div>
          )}
          {motorista.endereco && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-sm">{motorista.endereco}</span>
            </div>
          )}
        </div>
      </div>

      {/* Work Information */}
      <div className="px-4 py-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Informações de Trabalho</h3>
        <div className="space-y-3">
          {motorista.inicio && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data de Início</span>
              </div>
              <span className="font-semibold text-sm">{fmtDate(motorista.inicio)}</span>
            </div>
          )}
          {motorista.valor_semanal && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valor Semanal</span>
              </div>
              <span className="font-semibold text-sm text-primary">{fmtBRL(motorista.valor_semanal)}</span>
            </div>
          )}
          {veiculo && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <span className="text-sm text-muted-foreground">Veículo</span>
              <span className="font-semibold text-sm">{veiculo.modelo} ({veiculo.placa})</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      {pagamentosRecentes.length > 0 && (
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pagamentos Recentes</h3>
          <div className="space-y-2">
            {pagamentosRecentes.map((pagamento) => (
              <div
                key={pagamento.id}
                className="p-3 rounded-lg border border-border/50 bg-card flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{fmtBRL(pagamento.valor)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fmtDate(pagamento.data)}</p>
                </div>
                <Badge className={`flex-shrink-0 text-xs ${getPaymentStatusColor(pagamento.status)}`}>
                  {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {(motorista.contrato_url || motorista.antecedentes_url || motorista.comprovante_residencia_url) && (
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Documentos</h3>
          <div className="space-y-2">
            {motorista.contrato_url && (
              <button
                onClick={() => window.open(motorista.contrato_url, "_blank")}
                className="w-full p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/10 transition-colors flex items-center gap-3 text-left"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">Contrato</span>
              </button>
            )}
            {motorista.antecedentes_url && (
              <button
                onClick={() => window.open(motorista.antecedentes_url, "_blank")}
                className="w-full p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/10 transition-colors flex items-center gap-3 text-left"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">Antecedentes Criminais</span>
              </button>
            )}
            {motorista.comprovante_residencia_url && (
              <button
                onClick={() => window.open(motorista.comprovante_residencia_url, "_blank")}
                className="w-full p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/10 transition-colors flex items-center gap-3 text-left"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">Comprovante de Residência</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMotoristaDetalhe;
