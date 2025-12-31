import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, ArrowRight, Home } from "lucide-react";

interface SaveCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  nextSectionRoute?: string;
  nextSectionName?: string;
}

/**
 * Modal shown after saving a section.
 * Gives seniors 3 clear choices instead of forcing linear navigation.
 */
export function SaveCompletionModal({
  open,
  onOpenChange,
  sectionName,
  nextSectionRoute,
  nextSectionName,
}: SaveCompletionModalProps) {
  const navigate = useNavigate();

  const handleReturnToPlan = () => {
    onOpenChange(false);
    navigate("/preplandashboard/overview");
  };

  const handleViewDocument = () => {
    onOpenChange(false);
    navigate("/preplan-summary");
  };

  const handleContinueNext = () => {
    onOpenChange(false);
    if (nextSectionRoute) {
      navigate(nextSectionRoute);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">Saved</DialogTitle>
              <DialogDescription className="text-sm">
                {sectionName} has been saved.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            What would you like to do next?
          </p>

          {/* Option 1: Return to Plan Overview */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3 px-4"
            onClick={handleReturnToPlan}
          >
            <Home className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium">Return to My Plan</div>
              <div className="text-xs text-muted-foreground">See all your sections</div>
            </div>
          </Button>

          {/* Option 2: View Document */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3 px-4"
            onClick={handleViewDocument}
          >
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium">View My Document</div>
              <div className="text-xs text-muted-foreground">Preview or print what you have so far</div>
            </div>
          </Button>

          {/* Option 3: Continue to Next Section (if available) */}
          {nextSectionRoute && nextSectionName && (
            <Button
              variant="default"
              className="w-full justify-start gap-3 h-auto py-3 px-4"
              onClick={handleContinueNext}
            >
              <ArrowRight className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Continue to {nextSectionName}</div>
                <div className="text-xs opacity-80">Keep going with the next section</div>
              </div>
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground pt-4 border-t mt-4">
          You can always come back to any section later.
        </p>
      </DialogContent>
    </Dialog>
  );
}
