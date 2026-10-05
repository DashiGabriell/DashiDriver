import { useCountAnimation } from "@/hooks/useCountAnimation";

/**
 * Componente de demonstração das animações de contagem
 * Use este componente para testar diferentes configurações
 */
export const AnimationDemo = () => {
  const count1 = useCountAnimation(6, 2, 0);
  const count2 = useCountAnimation(3, 2, 0.075);
  const count3 = useCountAnimation(10500, 2, 0.15, true);
  const count4 = useCountAnimation(1930, 2, 0.3, true);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Demonstração de Animações</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="neu p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Frota Total
          </div>
          <div className="font-display text-3xl font-bold mt-1.5">
            <span ref={count1}>0</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            4 alugados · 1 ociosos
          </div>
        </div>

        {/* Card 2 */}
        <div className="neu p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Contratos Ativos
          </div>
          <div className="font-display text-3xl font-bold mt-1.5">
            <span ref={count2}>0</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            1 em atraso
          </div>
        </div>

        {/* Card 3 */}
        <div className="neu p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Receita do Mês
          </div>
          <div className="font-display text-3xl font-bold mt-1.5">
            R$ <span ref={count3}>0</span>
          </div>
          <div className="text-xs text-success mt-2">
            +12,4%
          </div>
        </div>

        {/* Card 4 */}
        <div className="neu p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Lucro Estimado
          </div>
          <div className="font-display text-3xl font-bold mt-1.5">
            R$ <span ref={count4}>0</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Custos R$ 8.570,00
          </div>
        </div>
      </div>

      <div className="neu p-6">
        <h2 className="text-xl font-bold mb-4">Configurações</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Duração:</strong> 2 segundos</p>
          <p><strong>Easing:</strong> easeOut (suave)</p>
          <p><strong>Delays:</strong> 0s, 0.075s, 0.15s, 0.3s</p>
          <p><strong>Formatação:</strong> pt-BR com separador de milhares</p>
        </div>
      </div>
    </div>
  );
};
