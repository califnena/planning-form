import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLockState } from "@/contexts/PreviewModeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { isEmotionalStageRoute } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface PreviewLockBannerProps {
  /** Optional custom message */
  message?: string;
  /** Whether to show as compact inline notice */
  compact?: boolean;
}

/**
 * Calm, non-aggressive banner for preview/locked mode.
 * 
 * Shows when user is in preview mode (not unlocked).
 * Non-blocking, displayed once at top of planner.
 * Suppressed on emotional stage routes.
 */
export function PreviewLockBanner({ 
  message,
  compact = false
}: PreviewLockBannerProps) {
  const { isLocked, isLoading } = useLockState();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show if unlocked, still loading, or on emotional stage routes
  if (!isLocked || isLoading || isEmotionalStageRoute(location.pathname)) {
    return null;
  }

  const handleUnlock = () => {
    // Navigate to pricing/plans page
    navigate("/pricing");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 border border-muted px-3 py-2 rounded-md">
        <Eye className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <span className="flex-1">{message || "You're viewing the planner"}</span>
        <Button
          variant="link"
          size="sm"
          onClick={handleUnlock}
          className="h-auto p-0 text-primary font-medium"
        >
          Choose a Plan
        </Button>
      </div>
    );
  }

  // Default banner with exact wording
  return (
    <Card className="border border-muted bg-muted/30 mb-6">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-primary mt-0.5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <p className="text-foreground font-medium">
                You're in preview mode.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You can look through the planner and see how it works.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When you're ready, you can choose a plan to save or fill things in.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                There's no rush.
              </p>
            </div>
          </div>
        
          <div className="flex-shrink-0">
            <Button
              onClick={handleUnlock}
              variant="outline"
              size="sm"
              className="text-primary border-primary/30 hover:bg-primary/5"
            >
              Choose a Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline locked notice for use within form sections.
 * Shows a subtle indicator that editing is disabled.
 */
export function InlineLockedNotice() {
  const { isLocked, isLoading } = useLockState();
  const navigate = useNavigate();
  const location = useLocation();

  // Suppress on emotional stage routes
  if (!isLocked || isLoading || isEmotionalStageRoute(location.pathname)) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground py-1 px-2 bg-muted/30 rounded inline-flex items-center gap-1.5">
      <Eye className="h-3 w-3 text-primary/70" />
      <span>Preview mode – explore freely</span>
    </div>
  );
}
