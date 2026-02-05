import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface PreviewModeTooltipProps {
  children: ReactNode;
  enabled?: boolean;
}

export function PreviewModeTooltip({ children, enabled = true }: PreviewModeTooltipProps) {
  if (!enabled) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You're viewing the planner. Choose a plan to save your work.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
