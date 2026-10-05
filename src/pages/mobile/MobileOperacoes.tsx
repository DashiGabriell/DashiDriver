// @ts-nocheck
import { Filter, Search } from "lucide-react";
import SwipeableCard from "@/components/mobile/ui/SwipeableCard";
import OperationCard from "@/components/mobile/operacoes/OperationCard";
import FloatingCreateButton from "@/components/mobile/operacoes/FloatingCreateButton";
import { toast } from "sonner";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const MobileOperacoes = () => {
  const handleConfirm = (id: string) => {
    toast.success(`Operação ${id} confirmada!`);
  };

  const handleDelete = (id: string) => {
    toast.error(`Operação ${id} removida.`);
  };

  const handleCreate = () => {
    toast.info("Abrir formulário de nova operação");
  };

  // Fetch operations from Supabase (assuming table carcontrol_operations exists)
  const { data: operations = [], loading, error } = useRealtimeData("carcontrol_operations");

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center justify-between px-2 mb-6">
        <h2 className="text-2xl font-bold font-display">Operações</h2>
        <div className="flex gap-2">
          <button className="neu-sm p-2 rounded-xl text-muted-foreground"><Search className="w-5 h-5" /></button>
          <button className="neu-sm p-2 rounded-xl text-muted-foreground"><Filter className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <p>Carregando operações...</p>}
        {error && <p className="text-danger">Erro ao carregar operações.</p>}
        {operations.map((op: any) => (
          <SwipeableCard
            key={op.id}
            onConfirm={() => handleConfirm(op.id)}
            onDelete={() => handleDelete(op.id)}
            onWhatsApp={() => window.open(`https://wa.me/${op.whatsapp || "5500000000000"}`)}
          >
            <OperationCard
              id={op.id}
              tipo={op.tipo}
              data={op.data}
              titulo={op.titulo}
              subtitulo={op.subtitulo}
              valor={op.valor}
              status={op.status}
              statusType={op.status_type as any}
            />
          </SwipeableCard>
        ))}

        {/* Empty State visual refinement */}
        <div className="neu p-10 text-center rounded-[32px] mt-10 border border-dashed border-border/50">
          <p className="text-sm text-muted-foreground">Arraste para a direita para confirmar ou esquerda para remover.</p>
        </div>
      </div>

      <FloatingCreateButton onClick={handleCreate} />
    </div>
  );
};

export default MobileOperacoes;
