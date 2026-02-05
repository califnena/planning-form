import { Lock, Unlock } from "lucide-react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLockState } from "@/contexts/PreviewModeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { isEmotionalStageRoute } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  message = "You're exploring the planner in preview mode.",
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
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Preview Mode
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  You're viewing a preview of the Digital Planner.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This shows how planning works step by step.
                  To enter and save your own information, full access is required.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleUnlock}
                  className="gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock Full Planner
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
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/20 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Eye className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium text-base">
            Preview Mode — Explore freely, no changes are saved.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Ready to save your information? Unlock to enable editing.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            onClick={handleUnlock}
            size="sm"
            className="shadow-sm"
          >
            <Unlock className="h-4 w-4 mr-1.5" />
            Unlock
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
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 bg-muted/50 rounded">
      <Eye className="h-3 w-3 text-primary" />
      <span>Preview mode — view only</span>
      <button
        onClick={() => navigate("/pricing")}
        className="text-primary hover:underline font-medium"
      >
        Unlock to edit
      </button>
    </div>
  );
}
