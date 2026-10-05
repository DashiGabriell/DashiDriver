import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export const MobileContainer = ({ children, className }: MobileContainerProps) => {
  return (
    <div className={cn("container px-4 py-6 max-w-lg mx-auto pb-24", className)}>
      {children}
    </div>
  );
};

export default MobileContainer;
