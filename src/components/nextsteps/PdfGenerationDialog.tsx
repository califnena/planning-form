import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { generateAfterLifePlanPDF } from "@/lib/afterLifePlanPdfGenerator";
import { generateBlankAfterLifePlanPDF } from "@/lib/blankAfterLifePlanPdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface PdfGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  decedentName: string;
}

export function PdfGenerationDialog({
  open,
  onOpenChange,
  formData,
  decedentName,
}: PdfGenerationDialogProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleGenerateFilled = async () => {
    setGenerating(true);
    try {
      await generateAfterLifePlanPDF(formData, decedentName);
      toast({
        title: "PDF Generated",
        description: "Your After-Life Action Plan has been downloaded successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateBlank = async () => {
    setGenerating(true);
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "Blank PDF Generated",
        description: "Your blank After-Life Action Plan has been downloaded successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate blank PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate After-Life Action Plan Document</DialogTitle>
          <DialogDescription>
            Choose which version you'd like to download:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Filled Document</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download a PDF with all your entered information pre-filled, ready for review or printing.
            </p>
            <Button
              onClick={handleGenerateFilled}
              disabled={generating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Filled Document
            </Button>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Blank Document</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download a blank PDF template to print and fill in by hand.
            </p>
            <Button
              onClick={handleGenerateBlank}
              disabled={generating}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Blank Document
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
