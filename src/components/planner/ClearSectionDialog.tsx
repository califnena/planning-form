import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";

interface ClearSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  onConfirmClear: () => void;
}

type DialogStep = "input" | "confirm";

export function ClearSectionDialog({
  open,
  onOpenChange,
  sectionName,
  onConfirmClear,
}: ClearSectionDialogProps) {
  const [step, setStep] = useState<DialogStep>("input");
  const [inputValue, setInputValue] = useState("");

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setStep("input");
      setInputValue("");
    }
    onOpenChange(isOpen);
  };

  const handleContinue = () => {
    if (inputValue.trim().toUpperCase() === "CLEAR") {
      setStep("confirm");
    }
  };

  const handleClearNow = () => {
    onConfirmClear();
    handleOpenChange(false);
  };

  const isInputValid = inputValue.trim().toUpperCase() === "CLEAR";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>
              {step === "input" ? "Clear this section?" : "Final confirmation"}
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        {step === "input" ? (
          <>
            <AlertDialogDescription className="space-y-4">
              <p>
                You are about to clear the <strong>{sectionName}</strong> section.
                This cannot be undone.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirm-clear" className="text-foreground">
                  Type <strong>CLEAR</strong> to continue:
                </Label>
                <Input
                  id="confirm-clear"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type CLEAR"
                  className="font-mono"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleContinue}
                disabled={!isInputValid}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogDescription>
              <p>
                All data in <strong>{sectionName}</strong> will be permanently deleted.
                Are you absolutely sure?
              </p>
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearNow}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear now
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
