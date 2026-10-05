import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface ChecklistStep {
  key: string;
  label: string;
  required: boolean;
  order: number;
  status?: "pending" | "completed" | "skipped";
}

interface ChecklistStepperProps {
  steps: ChecklistStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export function ChecklistStepper({
  steps,
  currentStepIndex,
  onStepChange,
}: ChecklistStepperProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium">
          Passo {currentStepIndex + 1} de {steps.length}
        </div>
        <div className="text-sm text-muted-foreground">
          {Math.round(progress)}% concluído
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = step.status === "completed";

          return (
            <button
              key={step.key}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border transition-all",
                isCurrent 
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                  : isCompleted
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-background text-muted-foreground border-input"
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <Circle className={cn("h-3 w-3", isCurrent && "fill-current")} />
              )}
              <span className="text-xs font-medium whitespace-nowrap">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
