import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/mobile/useHaptics";

interface FloatingCreateButtonProps {
  onClick: () => void;
}

export const FloatingCreateButton = ({ onClick }: FloatingCreateButtonProps) => {
  const { trigger } = useHaptics();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        trigger("heavy");
        onClick();
      }}
      className="fixed bottom-24 right-6 w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-neu-accent z-40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="w-8 h-8" />
    </motion.button>
  );
};

export default FloatingCreateButton;
