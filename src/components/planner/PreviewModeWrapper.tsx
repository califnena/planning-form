import { ReactNode } from "react";
import { usePreviewMode } from "@/pages/PlannerApp";

interface PreviewModeWrapperProps {
  children: ReactNode;
}

/**
 * Wraps section content and automatically disables all inputs when in preview mode
 */
export function PreviewModeWrapper({ children }: PreviewModeWrapperProps) {
  const { isPreviewMode } = usePreviewMode();
  
  if (!isPreviewMode) {
    return <>{children}</>;
  }

  // When in preview mode, wrap in a div that intercepts pointer events
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 cursor-not-allowed" title="Available with subscription. You're in Preview Mode." />
    </div>
  );
}
