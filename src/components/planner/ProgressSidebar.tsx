import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressSidebarProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

export const ProgressSidebar = ({ 
  steps, 
  currentStepIndex,
  onStepClick 
}: ProgressSidebarProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 px-2">
        Progress
      </h3>
      
      <nav className="space-y-1">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = step.completed;
          const isPast = index < currentStepIndex;
          
          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left",
                isCurrent 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent/50",
                onStepClick && "cursor-pointer"
              )}
            >
              {/* Step indicator */}
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors",
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : isCurrent 
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step label */}
              <span className="flex-1 truncate">{step.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
