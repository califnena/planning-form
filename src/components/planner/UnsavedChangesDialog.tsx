/**
 * Senior-friendly confirmation dialog for unsaved changes protection.
 * Uses calm, reassuring language to prevent accidental data loss.
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
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-warning" />
            </div>
          </div>
          <DialogTitle className="text-xl">
            You have unsaved changes
          </DialogTitle>
          <DialogDescription className="text-base mt-2 leading-relaxed">
            If you leave now, the changes you just made won't be saved.
            <br />
            Would you like to stay and save your work?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 sm:flex-col mt-4">
          <Button
            size="lg"
            className="w-full py-6 text-base"
            onClick={onCancel}
          >
            Stay and save my work
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full py-6 text-base"
            onClick={onConfirm}
          >
            Leave without saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
