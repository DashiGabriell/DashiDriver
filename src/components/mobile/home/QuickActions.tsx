import { useNavigate } from "react-router-dom";
import { useHaptics } from "@/hooks/mobile/useHaptics";

const ACTIONS = [
  { icon: "/assets/receitatotal.png", label: "Alugueis", color: "bg-success/10", path: "/mobile/alugueis" },
  { icon: "/assets/config.png", label: "Manutenção", color: "bg-orange-500/10", path: "/mobile/manutencao" },
  { icon: "/assets/motorista.png", label: "Motorista", color: "bg-blue-500/10", path: "/mobile/motoristas" },
  { icon: "/assets/carro.png", label: "Veículo", color: "bg-primary/10", path: "/mobile/frota" },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const { trigger } = useHaptics();

  const handleActionClick = (path: string) => {
    trigger("medium");
    navigate(path);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleActionClick(action.path)}
            className="neu-interactive p-5 flex flex-col items-center justify-center gap-3 rounded-[32px] group active:scale-95 transition-transform"
          >
            <div className={`p-3 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}>
              <img 
                src={action.icon} 
                alt={action.label}
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xs font-bold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
