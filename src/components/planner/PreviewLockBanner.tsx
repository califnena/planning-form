import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLockState } from "@/contexts/PreviewModeContext";
import { useNavigate } from "react-router-dom";

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
 * Provides clear CTA to unlock without modal popups.
 */
export function PreviewLockBanner({ 
  message = "Preview mode. To make changes or save updates, unlock your plan.",
  compact = false 
}: PreviewLockBannerProps) {
  const { isLocked, isLoading } = useLockState();
  const navigate = useNavigate();

  // Don't show if unlocked or still loading
  if (!isLocked || isLoading) {
    return null;
  }

  const handleUnlock = () => {
    // Navigate to pricing/plans page
    navigate("/pricing");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
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
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-amber-900 dark:text-amber-100 font-medium text-base">
            {message}
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
            Your information stays private. You can unlock anytime.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            onClick={handleUnlock}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Unlock className="h-4 w-4 mr-1.5" />
            Unlock my plan
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

  if (!isLocked || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
      <Lock className="h-3 w-3" />
      <span>Read-only</span>
      <button
        onClick={() => navigate("/pricing")}
        className="text-primary hover:underline font-medium"
      >
        Unlock to edit
      </button>
    </div>
  );
}
