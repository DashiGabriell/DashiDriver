import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  label: string;
  image: string;
}

const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: "all", label: "Todos", image: "/assets/categorias-todas.png" },
];

export const CATEGORY_IMAGES: Record<string, string> = {
  "UberX/99POP": "/assets/uberx99pop.png",
  "Comfort": "/assets/comfort.png",
  "Black/Executivo": "/assets/blackexecutive.png",
  "Utilitário": "/assets/utilitario.png",
  "Veiculos": "/assets/carroPreto.png",
};

export const CategoryScroll = ({ 
  selected, 
  onSelect,
  categories,
}: { 
  selected: string; 
  onSelect: (id: string) => void;
  categories?: CategoryItem[];
}) => {
  const items = categories ?? FALLBACK_CATEGORIES;

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-none snap-x">
      {items.map((cat) => {
        const isActive = selected === cat.id;

        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-3xl transition-all snap-center",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors overflow-hidden",
              isActive ? "bg-white/20" : "bg-background/80"
            )}>
              <img src={cat.image} alt={cat.label} className="w-13 h-13 object-contain" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryScroll;
