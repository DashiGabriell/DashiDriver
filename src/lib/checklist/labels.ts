/** Shared checklist presentation helpers (desktop + mobile). */

export const CHECKLIST_STATUS_LABEL: Record<string, string> = {
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const CHECKLIST_TYPE_LABEL: Record<string, string> = {
  entrega: "Entrega",
  devolucao: "Devolução",
  troca_motorista: "Troca de Motorista",
  pos_manutencao: "Pós Manutenção",
  avaria: "Avaria",
  auditoria: "Auditoria",
  semanal_automatizada: "Vistoria Semanal",
  manutencao: "Manutenção",
};

export function getChecklistTypeLabel(type: string) {
  return CHECKLIST_TYPE_LABEL[type] || type;
}

export function getChecklistStatusLabel(status: string) {
  return CHECKLIST_STATUS_LABEL[status] || status;
}
