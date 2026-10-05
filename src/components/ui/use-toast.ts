import type { ReactNode } from "react";
import { toast as sonner } from "sonner";

type ToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
};

/** API no formato do antigo toast do shadcn, renderizada pelo sonner. */
export function toast({ title, description, variant }: ToastOptions) {
  const message = title ?? description ?? "";
  const options = title && description ? { description } : undefined;
  return variant === "destructive" ? sonner.error(message, options) : sonner.success(message, options);
}

export function useToast() {
  return { toast };
}
