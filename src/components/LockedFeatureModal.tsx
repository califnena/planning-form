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
import { Eye } from "lucide-react";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";

/**
 * Modal shown when preview users try to type or save.
 * Gentle nudge to unlock with single clear CTA.
 */
export function LockedFeatureModal() {
  const navigate = useNavigate();
  const {
    showLockedModal,
    closeLockedModal,
  } = usePreviewModeContext();

  const handleUnlock = () => {
    closeLockedModal();
    navigate("/pricing");
  };

  const handleContinuePreview = () => {
    closeLockedModal();
  };

  return (
    <Dialog open={showLockedModal} onOpenChange={closeLockedModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Digital Planning Access Required</DialogTitle>
          <DialogDescription className="text-center">
            To save or edit your wishes, Digital Planning Access is required.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={handleContinuePreview} className="gap-2 w-full">
            <Eye className="h-4 w-4" />
            View Sample Pages
          </Button>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            This lets you look at example sections only.<br />
            To save or edit your information, access is required.
          </p>
          <Button onClick={handleUnlock} className="w-full">
            Unlock Full Planner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
