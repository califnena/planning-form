import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface SectionStatusIndicatorProps {
  hasContent: boolean;
  className?: string;
}

/**
 * Soft, non-judgmental section status indicator.
 * - Shows a subtle checkmark if section has content
 * - Shows a soft empty circle if section is empty (NOT an error)
 * - No red, no warning colors - just informational
 */
export function SectionStatusIndicator({ hasContent, className }: SectionStatusIndicatorProps) {
  if (hasContent) {
    return (
      <CheckCircle2 
        className={cn(
          "h-4 w-4 text-green-500/70",
          className
        )} 
      />
    );
  }

  return (
    <Circle 
      className={cn(
        "h-4 w-4 text-muted-foreground/40",
        className
      )} 
    />
  );
}

/**
 * Small text label for section status - friendly language
 */
export function SectionStatusLabel({ hasContent }: { hasContent: boolean }) {
  if (hasContent) {
    return (
      <span className="text-xs text-green-600/70 font-medium">
        Added
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground/60">
      Optional
    </span>
  );
}
