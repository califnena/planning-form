import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Eye } from "lucide-react";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";

/**
 * Modal shown when preview users try to use locked features.
 * Provides clear path to sign in or continue previewing.
 */
export function LockedFeatureModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    showLockedModal,
    lockedModalMessage,
    closeLockedModal,
    saveLastVisitedRoute
  } = usePreviewModeContext();

  const handleSignIn = () => {
    // Save current route before redirecting to login
    saveLastVisitedRoute(location.pathname + location.search);
    closeLockedModal();
    navigate("/login");
  };

  const handleContinuePreview = () => {
    closeLockedModal();
  };

  return (
    <Dialog open={showLockedModal} onOpenChange={closeLockedModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Sign In Required</DialogTitle>
          <DialogDescription className="text-center">
            {lockedModalMessage || "Sign in to save your progress and personalize your plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
          <p>You can come back later. Nothing is lost.</p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleContinuePreview} className="gap-2 flex-1">
            <Eye className="h-4 w-4" />
            Continue Preview
          </Button>
          <Button onClick={handleSignIn} className="gap-2 flex-1">
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
