# Controle de Quilometragem — Plano de Implementação

## Status: Aprovado para implementação

---

## Análise do Código Existente

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript + Vite 8 |
| Estilo | Tailwind CSS 3 + Radix UI + Neumorphism |
| Formulários | react-hook-form + zod |
| Backend/DB | Supabase (PostgreSQL) sem ORM — queries diretas |
| Estado/API | TanStack React Query v5 |
| Charts | Recharts |

### O que já existe

| Item | Onde | Status |
|---|---|---|
| `km_atual` INTEGER em `carcontrol_vehicles` | `Veiculos.tsx` (form) / `VeiculoDetalhe.tsx` (display) | ✅ Existe |
| `km_atual` em `carcontrol_maintenances` | `Manutencao.tsx` / `MobileManutencaoNew.tsx` | ✅ Existe |
| Step `painel` em checklists | `constants.ts` (semanal, entrega, devolucao, avaria) | ✅ Existe |
| Input numérico de KM no painel | — | ❌ Não existe |
| `vehicle_km_history` | — | ❌ Não existe |
| Histórico de KM consolidado | — | ❌ Não existe |

### Onde KM é inserido/alterado hoje (todos os pontos)

1. **`Veiculos.tsx:389`** — Formulário de criar/editar veículo: `km_atual: Number(formValues.km_atual)`
2. **`Manutencao.tsx:236`** — Formulário de manutenção: `km_atual: parseInt(formData.km_atual)`
3. **`MobileManutencaoNew.tsx:57`** — Form mobile de manutenção
4. **Checklists (futuro)** — Step `painel` com `odometro_km`

---

## Decisões de Arquitetura

### Coluna `odometro_km` na `carcontrol_checklist_images` (em vez de modificar steps genéricos)

Motivo: o sistema de steps é genérico (foto + label). Em vez de quebrar a abstração, adicionamos uma coluna opcional `odometro_km INTEGER` na tabela de imagens. Apenas imagens com `step_key = 'painel'` terão esse campo preenchido. Isso mantém a arquitetura limpa e reaproveita todo o fluxo existente de captura, upload e exibição.

### Tabela `vehicle_km_history` como fonte da verdade histórica

Toda vez que KM é registrado (checklist, manutenção, edição manual), um registro é criado em `vehicle_km_history` via um serviço central (`kmHistoryService`). O `carcontrol_vehicles.km_atual` é atualizado como cache/denormalização para consultas rápidas.

### Serviço central `kmHistoryService`

Evita duplicação de lógica. Todos os 5 pontos de entrada de KM chamam o mesmo serviço, garantindo consistência.

### Correção de KM (regra de negócio)

O hodômetro de um veículo nunca volta — mas o *usuário* pode digitar errado. Por isso a validação é **alerta, não bloqueio**:

```
Se KM < último registrado:
  ⚠ "KM menor que o último registrado (125.500 km).
     Confirma que deseja inserir este valor?"
  [Sim, é uma correção] [Não, voltar]
```

**Nada é sobrescrito.** O registro original permanece no histórico. A correção vira uma nova entrada com `source = 'manual_edit'` e `observation` preenchendo o motivo.

O `vehicles.km_atual` assume o último valor inserido (seja maior ou menor) — porque ele é apenas um cache de leitura. A fonte da verdade é o histórico completo.

---

# 1. Banco de Dados

## 1.1 Migration: `vehicle_km_history`

```sql
CREATE TABLE public.vehicle_km_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES carcontrol_companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES carcontrol_vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES carcontrol_drivers(id) ON DELETE SET NULL,
  km INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('checklist','maintenance','manual_edit')),
  source_id UUID,
  observation TEXT,              -- motivos de correção, observações
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_km_history_vehicle ON public.vehicle_km_history(vehicle_id, created_at DESC);
CREATE INDEX idx_km_history_company ON public.vehicle_km_history(company_id);
```

## 1.2 Migration: Adicionar colunas

```sql
ALTER TABLE public.carcontrol_checklist_images
  ADD COLUMN odometro_km INTEGER;

ALTER TABLE public.carcontrol_vehicles
  ADD COLUMN ultima_atualizacao_km TIMESTAMPTZ;
```

## 1.3 Atualizar RPC `get_checklist_with_images`

Adicionar `'odometro_km', ci.odometro_km` ao `jsonb_build_object` da função.

---

# 2. Serviço Central de KM

Arquivo novo: `src/integrations/supabase/services/kmHistoryService.ts`

```typescript
export const kmHistoryService = {
  // Registra um ponto de KM no histórico
  async record(params: {
    company_id: string
    vehicle_id: string
    driver_id?: string | null
    km: number
    source: 'checklist' | 'maintenance' | 'manual_edit'
    source_id?: string
    observation?: string           // para correções: "Valor incorreto, digitei 150.000"
  }): Promise<void> {
    await supabase.from('vehicle_km_history').insert({
      company_id: params.company_id,
      vehicle_id: params.vehicle_id,
      driver_id: params.driver_id,
      km: params.km,
      source: params.source,
      source_id: params.source_id,
      observation: params.observation || null,
    })
  },

  // Atualiza o KM atual do veículo (cache — sempre aceita o último valor)
  async updateVehicleKm(vehicleId: string, km: number): Promise<void> {
    await supabase.from('carcontrol_vehicles').update({
      km_atual: km,
      ultima_atualizacao_km: new Date().toISOString(),
    }).eq('id', vehicleId)
  },

  // Busca histórico de KM de um veículo (mais recente primeiro)
  async getHistory(vehicleId: string, limit = 20) {
    return supabase.from('vehicle_km_history')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(limit)
  },

  // Estatísticas para o card do veículo
  async getStats(vehicleId: string) {
    // KM atual, rodado nos últimos 30 dias, média diária
  },
}
```

---

# 3. Checklist com Campo de KM

## 3.1 Fluxo completo

```txt
Checklist (qualquer tipo com step 'painel')
      ↓
Tirar foto do painel
      ↓
Digitar KM manualmente
      ↓
Validar: apenas números
      ↓
Se KM < último registrado:
  ⚠ Exibir alerta de confirmação
  [Sim, correção] → libera próximo campo de observação
  [Não] → volta para editar o KM
      ↓
Campo "Observação da correção" (se aplicável)
      ↓
[Confirmar] → Salvar imagem + odometro_km + observação no banco
      ↓
... (outros steps)
      ↓
[Finalizar Checklist]
      ↓
1. Ler odometro_km da imagem do painel
2. Chamar kmHistoryService.record({ source: 'checklist' })
```

## 3.2 Modificar `ChecklistCameraCapture.tsx`

Adicionar props opcionais:

```typescript
interface ChecklistCameraCaptureProps {
  // ... existentes
  kmValue?: number
  onKmChange?: (km: number) => void
  ultimoKm?: number
}
```

Quando `stepKey === 'painel'`, renderizar abaixo da preview:

```txt
┌─ Preview da foto ─────────────────┐
│                                    │
│  [X] fechar                        │
└────────────────────────────────────┘
┌─ KM Atual do Veículo * ───────────┐
│  [125500]                          │
│  Último KM registrado: 125.320 km │
└────────────────────────────────────┘

Se KM < último registrado:
┌─ ⚠ Atenção ─────────────────────┐
│ KM menor que o último registrado │
│ (125.320 km). Confirma?          │
│                                  │
│ [Sim, correção]  [Não, voltar]   │
└──────────────────────────────────┘

Se "Sim, correção" → exibir:
┌─ Motivo da correção ────────────┐
│  [Digitei 150.000 por engano]   │
└──────────────────────────────────┘

┌─ Observação (opcional) ──────────┐
│  [_______________]                 │
└────────────────────────────────────┘
[Tirar Novamente] [Confirmar]
```

## 3.3 Modificar `ChecklistImageUpload.tsx` (desktop)

Mesma lógica: input numérico condicional quando `stepKey === 'painel'`.

## 3.4 Modificar `useChecklistImages.ts`

Adicionar `odometroKm` aos `UploadParams` e enviar ao `checklistService.addImage`.

```typescript
interface UploadParams {
  // ... existentes
  odometroKm?: number
}
```

## 3.5 Modificar `checklistService.addImage`

Aceitar `odometro_km` no insert.

## 3.6 Modificar `checklistService.finalize`

Após finalizar o checklist, buscar a imagem com `step_key = 'painel'` e `odometro_km` preenchido e chamar `kmHistoryService`.

---

# 4. Manutenções com Histórico de KM

## `Manutencao.tsx` (linha 228-241)

Após salvar a manutenção:

```typescript
if (formData.km_atual) {
  await kmHistoryService.record({
    company_id,
    vehicle_id: formData.vehicle_id,
    km: parseInt(formData.km_atual),
    source: 'maintenance',
    source_id: maintenanceId,
  })
  await kmHistoryService.updateVehicleKm(formData.vehicle_id, parseInt(formData.km_atual))
}
```

## `MobileManutencaoNew.tsx`

Mesma lógica.

---

# 5. Edição Manual de KM

## `Veiculos.tsx` (linha 389)

Ao salvar veículo com `km_atual` alterado:

```typescript
if (kmAlterado) {
  await kmHistoryService.record({
    company_id,
    vehicle_id: vehicleId,
    km: Number(formValues.km_atual),
    source: 'manual_edit',
  })
  await kmHistoryService.updateVehicleKm(vehicleId, Number(formValues.km_atual))
}
```

---

# 6. Card de KM no Detalhe do Veículo

## `VeiculoDetalhe.tsx` — entre linha 693 e 695

```tsx
{/* ── Controle de Quilometragem ── */}
<div className="neu p-6 mb-8 animate-blur-in">
  <h2 className="font-display text-base font-bold mb-5 flex items-center gap-2">
    <Gauge className="w-4 h-4" /> Controle de Quilometragem
  </h2>

  {/* KPIs */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div className="neu-inset p-4 rounded-xl">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        KM Atual
      </div>
      <div className="font-display text-2xl font-bold text-foreground">
        125.500 km
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Última atualização: 22/06/2026
      </div>
    </div>
    <div className="neu-inset p-4 rounded-xl">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Rodado (30 dias)
      </div>
      <div className="font-display text-2xl font-bold text-primary">
        +4.350 km
      </div>
    </div>
    <div className="neu-inset p-4 rounded-xl">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        Média Diária
      </div>
      <div className="font-display text-2xl font-bold text-foreground">
        145 km/dia
      </div>
    </div>
  </div>

  {/* Tabela de Histórico */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
          <th className="text-left py-2 font-medium">Data</th>
          <th className="text-left py-2 font-medium">KM</th>
          <th className="text-left py-2 font-medium">Origem</th>
          <th className="text-left py-2 font-medium">Obs</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-border/40 text-muted-foreground">
          <td className="py-2">22/06</td>
          <td className="py-2 font-mono line-through">150.000 km</td>
          <td className="py-2">Checklist</td>
          <td className="py-2 text-xs">(digitado errado)</td>
        </tr>
        <tr className="border-b border-border/40">
          <td className="py-2">22/06</td>
          <td className="py-2 font-mono text-amber-600">105.000 km ↻</td>
          <td className="py-2">Correção</td>
          <td className="py-2 text-xs">Valor incorreto</td>
        </tr>
        <tr className="border-b border-border/40">
          <td className="py-2">15/06</td>
          <td className="py-2 font-mono">124.900 km</td>
          <td className="py-2">Checklist Semanal</td>
          <td className="py-2">—</td>
        </tr>
        <tr className="border-b border-border/40">
          <td className="py-2">08/06</td>
          <td className="py-2 font-mono">124.200 km</td>
          <td className="py-2">Manutenção</td>
          <td className="py-2">—</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

# 7. Hook `useVehicleKm`

Arquivo novo: `src/hooks/useVehicleKm.ts`

```typescript
export function useVehicleKm(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicle_km', vehicleId],
    queryFn: () => kmHistoryService.getStats(vehicleId),
    enabled: !!vehicleId,
  })
}
```

---

# 8. Indicadores Automáticos (Futuro)

### Veículos que mais rodam

```sql
SELECT
  v.id,
  v.placa,
  v.modelo,
  COALESCE(SUM(h.km) FILTER (WHERE h.created_at >= NOW() - INTERVAL '30 days'), 0) as km_mes
FROM carcontrol_vehicles v
LEFT JOIN vehicle_km_history h ON h.vehicle_id = v.id
WHERE v.company_id = :company_id
GROUP BY v.id
ORDER BY km_mes DESC
LIMIT 10
```

### Veículos parados

```sql
SELECT * FROM carcontrol_vehicles
WHERE company_id = :company_id
  AND (ultima_atualizacao_km IS NULL OR ultima_atualizacao_km < NOW() - INTERVAL '20 days')
```

### Próxima manutenção

Cruzar `vehicle_km_history.km` com `carcontrol_maintenances.proximo_km`.

### Uso excessivo

Alerta quando média diária > 300 km nos últimos 7 dias.

---

# 9. Trilha de Auditoria (Checklist)

```txt
☑ Foto do Painel
☑ KM Atual (odometro_km)
☑ Data/Hora automática (taken_at)
☑ GPS da vistoria (via metadata)
```

Isso cria uma trilha de auditoria muito forte. Se uma locadora questionar um motorista ("Você rodou 6 mil km em uma semana."), ela terá:

* foto;
* horário;
* localização;
* histórico.

Diferencial enorme para locação de aplicativos.

---

# 10. Funcionalidade Premium (Futuro)

### Pontuação de Uso do Veículo

```txt
Motorista João
★★★★★
Uso moderado
Média de 180 km/dia
Sem excessos.
```

ou

```txt
Motorista Pedro
★★☆☆☆
Rodou 420 km/dia
3 alertas de excesso.
```

Isso pode se tornar um módulo de **Telemetria Leve**, sem instalar equipamento no carro, usando apenas os checklists.

---

# Plano de Implementação (Ordem)

| Fase | O que | Arquivos |
|---|---|---|
| **1** | Migrations SQL | 2 novos arquivos em `supabase/migrations/` |
| **2** | `kmHistoryService.ts` | `src/integrations/supabase/services/kmHistoryService.ts` |
| **3** | Checklist: campo KM no mobile | `ChecklistCameraCapture.tsx`, `mobile/ChecklistDetail.tsx`, `useChecklistImages.ts`, `checklistService.ts` |
| **4** | Checklist: campo KM no desktop | `ChecklistImageUpload.tsx`, `ChecklistDetail.tsx` |
| **5** | Checklist: finalização com KM | `checklistService.ts` (finalize) |
| **6** | Manutenções: registrar KM | `Manutencao.tsx`, `MobileManutencaoNew.tsx` |
| **7** | Edição manual: registrar KM | `Veiculos.tsx` |
| **8** | Card de KM no detalhe | `VeiculoDetalhe.tsx`, `useVehicleKm.ts` |
| **9** | Regenerar types do Supabase | `supabase gen types` |

---

# Arquitetura Final

```txt
Checklists (step 'painel') ───┐
Manutenções (form km_atual) ──┤
Edição manual (form veículo) ─┘
              ↓
     vehicle_km_history
              ↓
   vehicles.km_atual (cache)
              ↓
   Dashboards, alertas, indicadores
```

Resolve a necessidade atual e abre caminho para várias funcionalidades premium no futuro.
