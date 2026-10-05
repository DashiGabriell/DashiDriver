import { useState, ReactNode } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Trash2, CheckCircle, MessageCircle } from "lucide-react";

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  onConfirm?: () => void;
  onWhatsApp?: () => void;
}

export const SwipeableCard = ({ children, onDelete, onConfirm, onWhatsApp }: SwipeableCardProps) => {
  const controls = useAnimation();
  const [dragX, setDragX] = useState(0);

  const handleDrag = (_: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100 && onDelete) {
      onDelete();
    } else if (info.offset.x > 100 && onConfirm) {
      onConfirm();
    }
    controls.start({ x: 0 });
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] mb-4 group">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
        <div className="flex items-center gap-2 text-success opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Confirmar</span>
        </div>
        <div className="flex items-center gap-2 text-danger opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-bold uppercase">Excluir</span>
          <Trash2 className="w-6 h-6" />
        </div>
      </div>

      {/* WhatsApp Quick Action (Top Layer Toggle) */}
      {onWhatsApp && (
        <button 
          onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
          className="absolute right-4 top-4 z-20 p-2 bg-success text-success-foreground rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      )}

      {/* Main Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 neu bg-background active:cursor-grabbing cursor-grab"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
