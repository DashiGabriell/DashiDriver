import { motion } from "framer-motion";
import { Heart, Star, Zap, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  item: {
    id: string;
    title: string;
    price: number;
    period?: string;
    rating: number;
    image: string;
    category: string;
    isFeatured?: boolean;
    condition: string;
    city?: string | null;
    state?: string | null;
  };
  index: number;
  onFavorite?: (id: string) => void;
}

export const ProductCard = ({ item, index, onFavorite }: ProductCardProps) => {
  const navigate = useNavigate();
  const location = [item.city, item.state].filter(Boolean).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/marketplace/detail/${item.id}`)}
      className="group relative flex flex-col gap-3 p-3 rounded-[2.5rem] bg-card border border-white/5 shadow-neu transition-all hover:shadow-neu-hover cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden rounded-[2rem]">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavorite?.(item.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>

        {item.isFeatured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-black text-[9px] uppercase tracking-widest rounded-lg px-2 py-1 gap-1">
            <Zap className="w-3 h-3 fill-current" />
            Destaque
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1 pb-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-[10px] font-bold">{item.rating}</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem] uppercase tracking-tighter">{item.title}</h3>
        
        {location && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}

        <div className="flex items-end justify-between mt-1">
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-foreground">
              R$ {item.price.toLocaleString('pt-BR')}
              {item.period && <span className="text-[10px] text-muted-foreground ml-1 font-bold">/ {item.period}</span>}
            </span>
          </div>
          <Badge variant="outline" className="text-[8px] font-black uppercase rounded-lg px-1.5 py-0.5 border-primary/20 text-primary">
            {item.condition}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
