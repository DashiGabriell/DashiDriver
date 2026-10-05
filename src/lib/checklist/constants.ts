export const ChecklistTypes = {
  ENTREGA: 'entrega',
  DEVOLUCAO: 'devolucao',
  TROCA_MOTORISTA: 'troca_motorista',
  POS_MANUTENCAO: 'pos_manutencao',
  AVARIA: 'avaria',
  AUDITORIA: 'auditoria',
  SEMANAL_AUTOMATIZADA: 'semanal_automatizada',
} as const;

export type ChecklistType = typeof ChecklistTypes[keyof typeof ChecklistTypes];

export const ChecklistStatuses = {
  EM_ANDAMENTO: 'em_andamento',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const;

export type ChecklistStatus = typeof ChecklistStatuses[keyof typeof ChecklistStatuses];

export const ChecklistSteps = {
  [ChecklistTypes.ENTREGA]: [
    { key: 'frente', label: 'Foto Frontal', required: true, order: 1 },
    { key: 'traseira', label: 'Foto Traseira', required: true, order: 2 },
    { key: 'lateral_dir', label: 'Lateral Direita', required: true, order: 3 },
    { key: 'lateral_esq', label: 'Lateral Esquerda', required: true, order: 4 },
    { key: 'interior_frente', label: 'Interior Frente', required: true, order: 5 },
    { key: 'painel', label: 'Painel (KM/Comb)', required: true, order: 6 },
    { key: 'pneus', label: 'Pneus', required: false, order: 7 },
    { key: 'avarias', label: 'Avarias (Extra)', required: false, order: 8 },
  ],
  [ChecklistTypes.DEVOLUCAO]: [
    { key: 'frente', label: 'Foto Frontal', required: true, order: 1 },
    { key: 'traseira', label: 'Foto Traseira', required: true, order: 2 },
    { key: 'lateral_dir', label: 'Lateral Direita', required: true, order: 3 },
    { key: 'lateral_esq', label: 'Lateral Esquerda', required: true, order: 4 },
    { key: 'interior_frente', label: 'Interior Frente', required: true, order: 5 },
    { key: 'painel', label: 'Painel (KM/Comb)', required: true, order: 6 },
    { key: 'pneus', label: 'Pneus', required: false, order: 7 },
    { key: 'limpeza', label: 'Estado de Limpeza', required: true, order: 8 },
  ],
  [ChecklistTypes.AVARIA]: [
    { key: 'geral', label: 'Foto Geral do Veículo', required: true, order: 1 },
    { key: 'dano_detalhe', label: 'Detalhe do Dano 1', required: true, order: 2 },
    { key: 'dano_detalhe_2', label: 'Detalhe do Dano 2', required: false, order: 3 },
    { key: 'painel', label: 'Painel (KM atual)', required: true, order: 4 },
  ],
  [ChecklistTypes.SEMANAL_AUTOMATIZADA]: [
    { key: 'frente', label: 'Foto Frontal', required: true, order: 1 },
    { key: 'traseira', label: 'Foto Traseira', required: true, order: 2 },
    { key: 'lateral_dir', label: 'Lateral Direita', required: true, order: 3 },
    { key: 'lateral_esq', label: 'Lateral Esquerda', required: true, order: 4 },
    { key: 'interior_frente', label: 'Interior Frente', required: true, order: 5 },
    { key: 'painel', label: 'Painel (KM/Comb)', required: true, order: 6 },
    { key: 'pneus', label: 'Pneus', required: true, order: 7 },
    { key: 'avarias', label: 'Avarias', required: true, order: 8 },
  ],
} as const;

export const IMAGE_CONFIG = {
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  QUALITY: 0.75,
  FORMAT: 'image/webp',
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 300,
  THUMBNAIL_QUALITY: 0.6,
} as const;

export const STORAGE_BUCKET = 'checklists';
