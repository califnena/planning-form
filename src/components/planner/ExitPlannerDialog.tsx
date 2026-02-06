/**
 * Senior-friendly dialog prompting users to review their plan before leaving Planning Mode.
 * Uses calm, supportive language to encourage review without pressure.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ExitPlannerDialogProps {
  open: boolean;
  onReview: () => void;
  onExit: () => void;
}

export function ExitPlannerDialog({
  open,
  onReview,
  onExit,
}: ExitPlannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onExit()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl">
            Before you go...
          </DialogTitle>
          <DialogDescription className="text-base mt-2 leading-relaxed">
            Would you like to review or save your planner before leaving?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 sm:flex-col mt-4">
          <Button
            size="lg"
            className="w-full py-6 text-base"
            onClick={onReview}
          >
            Review my plan
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 text-base"
            onClick={onExit}
          >
            Exit without reviewing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
