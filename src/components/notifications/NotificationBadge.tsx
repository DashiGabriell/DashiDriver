import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  tone?: "critical" | "operational";
  className?: string;
}

export function NotificationBadge({ count, tone = "critical", className }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white shadow-sm",
        tone === "critical" ? "bg-red-600" : "bg-amber-500",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
