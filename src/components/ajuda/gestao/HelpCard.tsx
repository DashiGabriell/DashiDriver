import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface HelpCardProps {
  titulo: string;
  descricao: string;
  icone: ReactNode;
  rotaAjuda: string;
  detalhes?: string[];
}

export const HelpCard = ({ titulo, descricao, icone, rotaAjuda, detalhes }: HelpCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(rotaAjuda)}
      className="neu-interactive p-6 bg-card group cursor-pointer flex flex-col transition-all hover:scale-[1.02]"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 grid place-items-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
          {icone}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold mb-1">{titulo}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{descricao}</p>
        </div>
      </div>

      {detalhes && detalhes.length > 0 && (
        <ul className="space-y-1.5 mt-2 mb-4">
          {detalhes.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Ver guia completo
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
};
