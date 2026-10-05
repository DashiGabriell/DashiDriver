import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[3px] border-[0.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-[22px] min-w-[22px] px-[3px] text-xs",
        lg:      "h-[26px] min-w-[26px] px-[5px] text-sm",
        sm:      "h-[18px] min-w-[18px] rounded-[2.5px] px-[3px] text-[10px]",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary hover:border-primary",
        destructive:
          "bg-destructive text-white border-white hover:bg-white hover:text-destructive hover:border-destructive",
        error:
          "bg-red-500/10 text-red-600 border-red-600 hover:bg-red-600 hover:text-white hover:border-white dark:bg-red-500/20 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-400 dark:hover:text-red-950 dark:hover:border-red-950",
        info:
          "bg-blue-500/10 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white hover:border-white dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-blue-950 dark:hover:border-blue-950",
        outline:
          "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background hover:border-background",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary-foreground hover:bg-secondary-foreground hover:text-secondary hover:border-secondary",
        success:
          "bg-green-500/10 text-green-700 border-green-700 hover:bg-green-700 hover:text-white hover:border-white dark:bg-green-500/20 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-400 dark:hover:text-green-950 dark:hover:border-green-950",
        warning:
          "bg-yellow-500/10 text-yellow-700 border-yellow-700 hover:bg-yellow-700 hover:text-white hover:border-white dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-yellow-950 dark:hover:border-yellow-950",
      },
    },
  },
);

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
  size?: VariantProps<typeof badgeVariants>["size"];
  render?: React.ReactElement;
  asChild?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  render,
  asChild = false,
  ...props
}: BadgeProps): React.ReactElement {
  const badgeClass = cn(badgeVariants({ variant, size }), className);

  if (render) {
    return React.cloneElement(render, {
      ...props,
      className: cn(badgeClass, (render.props as React.HTMLAttributes<HTMLElement>)?.className),
      "data-slot": "badge",
    } as React.HTMLAttributes<HTMLElement>);
  }

  const Comp = asChild ? Slot : "span";
  return <Comp className={badgeClass} data-slot="badge" {...props} />;
}
