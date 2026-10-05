import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius)_-_2px)] text-sm font-semibold ring-offset-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-plastic btn-plastic-primary",
        destructive: "btn-plastic btn-plastic-destructive",
        outline: "btn-plastic btn-plastic-outline",
        secondary: "btn-plastic btn-plastic-secondary",
        ghost: "btn-plastic-ghost text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sunset: "btn-plastic btn-plastic-coin",
        coin: "btn-plastic btn-plastic-coin",
        neu: "neu-interactive text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-[0.8125rem]",
        lg: "h-12 rounded-[var(--radius)] px-8 text-base",
        icon: "h-10 w-10 rounded-[calc(var(--radius)_-_4px)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
