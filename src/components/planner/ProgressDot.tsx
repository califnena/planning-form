import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface ProgressDotProps {
  completed: boolean;
  showLabel?: boolean;
}

/**
 * Soft, non-judgmental progress indicator.
 * - Green checkmark if section has content
 * - Subtle empty circle if section is empty (NOT an error state)
 */
export const ProgressDot = ({ completed, showLabel = false }: ProgressDotProps) => {
  if (completed) {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-4 w-4 text-green-500/80" />
        {showLabel && (
          <span className="text-xs text-green-600/70 font-medium">Added</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 border-muted-foreground/30 bg-transparent"
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground/60">Optional</span>
      )}
    </div>
  );
};
