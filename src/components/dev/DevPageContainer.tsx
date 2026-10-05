import { ReactNode } from "react";

interface DevPageContainerProps {
  title: string;
  children: ReactNode;
}

export function DevPageContainer({ title, children }: DevPageContainerProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
      <div className="bg-card border border-border p-4 lg:p-6 rounded-lg text-card-foreground">
        {children}
      </div>
    </div>
  );
}
