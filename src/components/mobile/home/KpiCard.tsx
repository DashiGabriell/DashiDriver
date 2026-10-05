import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "accent" | "danger" | "success" | "primary" | "warning";
  delay?: number;
  loading?: boolean;
}

export const KpiCard = ({ label, value, icon, color = "primary", delay = 0, loading = false }: KpiCardProps) => {
  const colorMap = {
    accent: "text-accent",
    danger: "text-danger",
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className="neu p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2 min-h-[120px]"
    >
      <div className={cn("p-2 rounded-full bg-background shadow-neu-sm mb-1", colorMap[color])}>
        {icon}
      </div>
      <span className={cn("text-2xl font-bold font-display", colorMap[color])}>
        {value}
      </span>
      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
        {label}
      </p>
    </motion.div>
  );
};

export default KpiCard;
