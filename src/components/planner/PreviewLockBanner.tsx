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
  /** Whether to show as a prominent welcome banner for preview mode */
  prominent?: boolean;
}

/**
 * Calm, non-aggressive banner for preview/locked mode.
 * 
 * Shows when user is in preview mode (not unlocked).
 * Provides clear CTA to unlock without modal popups.
 * Suppressed on emotional stage routes.
 */
export function PreviewLockBanner({ 
  message = "Preview mode. To save or edit your wishes, choose a plan.",
  compact = false,
  prominent = false
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

  // Prominent welcome banner for preview mode
  if (prominent) {
    return (
      <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  You're in preview mode.
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  You can look through the planner and see how it works.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  When you're ready, you can choose a plan to save or fill things in.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  There's no rush.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleUnlock}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
                >
                  Choose a Plan
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 px-3 py-2 rounded-md">
        <Eye className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <span className="flex-1">{message}</span>
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

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/10 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Eye className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium text-base mb-2">
            You're in preview mode.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You can look through the planner and see how it works. When you're ready, you can choose a plan to save or fill things in. There's no rush.
          </p>
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
    </div>
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
