import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";

const LucratividadeCard = ({
  v,
  index,
  max,
}: {
  v: any;
  index: number;
  max: number;
}) => {
  const lucro = (v.receita_mes || 0) - (v.custo_mes || 0);
  const pct = max > 0 ? (Math.abs(lucro) / max) * 100 : 0;
  const positivo = lucro >= 0;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const lucroRef = useCountAnimation(lucro, 2, index * 0.075, true);
  const receitaRef = useCountAnimation(v.receita_mes || 0, 2, index * 0.075, true);
  const parcelaRef = useCountAnimation(v.parcela || 0, 2, index * 0.08, true);
  const seguroRef = useCountAnimation(v.seguro || 0, 2, index * 0.1, true);
  const custoRef = useCountAnimation(v.custo_mes || 0, 2, index * 0.12, true);

  return (
    <div className="neu p-5 animate-blur-in transition-all duration-300 hover:neu-interactive">
      <div className="flex items-start gap-4 mb-4">
        <div className="neu-sm w-11 h-11 grid place-items-center">
          {positivo ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-lg leading-tight">
            {v.modelo} <span className="text-muted-foreground font-normal">{v.ano}</span>
          </h3>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{v.placa}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lucro real</div>
          <div className={`font-display text-2xl font-bold ${positivo ? "text-foreground" : "text-danger"}`}>
            R$ <span ref={lucroRef}>0,00</span>
          </div>
        </div>
      </div>

      <div className="neu-inset h-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: mounted ? `${pct}%` : "0%",
            background: positivo ? "var(--gradient-accent)" : "hsl(var(--danger))",
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Receita</div>
          <div className="font-semibold">R$ <span ref={receitaRef}>0,00</span></div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Parcela</div>
          <div className="font-semibold">R$ <span ref={parcelaRef}>0,00</span></div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Seguro</div>
          <div className="font-semibold">R$ <span ref={seguroRef}>0,00</span></div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Manutenção</div>
          <div className="font-semibold">R$ <span ref={custoRef}>0,00</span></div>
        </div>
      </div>
    </div>
  );
};

// Helper: intervalo do mês atual
const getMonthInterval = () => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return { inicio, fim };
};

const Lucratividade = () => {
  const { data: vehicles, loading } = useRealtimeData("carcontrol_vehicles");
  const [enriched, setEnriched] = useState<any[]>([]);

  useEffect(() => {
    if (!vehicles) return;
    const fetchDetails = async () => {
      const { inicio, fim } = getMonthInterval();
      const results = await Promise.all(
        vehicles.map(async (v) => {
          // Receita: pagamentos pagos com driver_id no mês
          const { data: payments, error: payErr } = await supabase
            .from("carcontrol_payments")
            .select("valor")
            .eq("vehicle_id", v.id)
            .eq("status", "pago")
            .not("driver_id", "is", null)
            .gte("data", inicio.toISOString().split('T')[0])
            .lte("data", fim.toISOString().split('T')[0]);
          const receita = payments?.reduce((s, p) => s + Number(p.valor || 0), 0) || 0;

          // Manutenções no mês
          const { data: maint, error: maintErr } = await supabase
            .from("carcontrol_maintenances")
            .select("valor")
            .eq("vehicle_id", v.id)
            .gte("data", inicio.toISOString().split('T')[0])
            .lte("data", fim.toISOString().split('T')[0]);
          const manutencao = maint?.reduce((s, m) => s + Number(m.valor || 0), 0) || 0;

          // Parcela e seguro já vêm do veículo ou podem ser atualizados via schedule (simplified)
          const parcela = Number(v.parcela) || 0;
          const seguro = Number(v.seguro) || 0;
          const custo = parcela + seguro + manutencao;

          return { ...v, receita_mes: receita, custo_mes: custo, parcela, seguro };
        })
      );
      setEnriched(results);
    };
    fetchDetails();
  }, [vehicles]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const sorted = [...enriched].sort(
    (a, b) => (b.receita_mes || 0) - (b.custo_mes || 0) - ((a.receita_mes || 0) - (a.custo_mes || 0))
  );
  const max = sorted.length > 0 ? Math.max(...sorted.map((v) => Math.abs((v.receita_mes || 0) - (v.custo_mes || 0)))) : 0;

  return (
    <AppShell>
      <Topbar
        title="Lucratividade por veículo"
        subtitle="Veja quais carros realmente dão lucro no mês"
        helpPath="/ajuda/gestao/lucratividade"
      />

      <div className="space-y-4">
        {sorted.map((v, i) => (
          <LucratividadeCard key={v.id} v={v} index={i} max={max} />
        ))}
        {enriched.length === 0 && (
          <div className="text-center py-20 neu p-10 text-muted-foreground">Nenhum dado de lucratividade disponível</div>
        )}
      </div>
    </AppShell>
  );
};

export default Lucratividade;
