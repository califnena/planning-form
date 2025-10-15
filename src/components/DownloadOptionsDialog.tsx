import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DownloadOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: "fillable" | "manual") => void;
}

export const DownloadOptionsDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: DownloadOptionsDialogProps) => {
  const [pdfMode, setPdfMode] = useState<"fillable" | "manual">("fillable");

  const handleConfirm = () => {
    onConfirm(pdfMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose PDF Format</DialogTitle>
          <DialogDescription>
            Select the type of PDF you'd like to download
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>PDF Format</Label>
            <RadioGroup value={pdfMode} onValueChange={(value) => setPdfMode(value as "fillable" | "manual")}>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="fillable" id="download-fillable" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="download-fillable" className="font-semibold cursor-pointer">
                    Fillable PDF (current)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete PDF with all your entered information
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="manual" id="download-manual" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="download-manual" className="font-semibold cursor-pointer">
                    Print Manually Fillable Form
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Blank form optimized for printing and filling out by hand with ruled lines and checkboxes
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
