import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import type { MissingField } from "@/hooks/usePdfValidation";

interface PdfReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missing: MissingField[];
  onFixItems: () => void;
}

export function PdfReadinessModal({
  open,
  onOpenChange,
  missing,
  onFixItems,
}: PdfReadinessModalProps) {
  const navigate = useNavigate();

  // Group missing items by section
  const groupedMissing = missing.reduce((acc, item) => {
    if (!acc[item.sectionKey]) {
      acc[item.sectionKey] = {
        sectionLabel: item.sectionLabel,
        fixRoute: item.fixRoute,
        items: [],
      };
    }
    acc[item.sectionKey].items.push(item);
    return acc;
  }, {} as Record<string, { sectionLabel: string; fixRoute: string; items: MissingField[] }>);

  const handleGoToSection = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  const handleGoFixAll = () => {
    onOpenChange(false);
    onFixItems();
    // Navigate to first missing section
    if (missing.length > 0) {
      navigate(missing[0].fixRoute);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Before We Create Your PDF
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            A few important items are missing. Once you add them, your document will be complete and ready to download.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 py-2">
            {Object.entries(groupedMissing).map(([sectionKey, section]) => (
              <div key={sectionKey} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    {section.sectionLabel}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGoToSection(section.fixRoute)}
                    className="gap-1 text-xs"
                  >
                    Go to section
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Alert className="mt-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Tip:</strong> You can choose "Unsure" or "Not decided yet" for any field — that still counts as complete.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGoFixAll} className="gap-2">
            Go Fix Missing Items
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Small badge component to show PDF readiness status
interface PdfReadinessBadgeProps {
  isReady: boolean;
  missingSectionCount: number;
  onFixClick: () => void;
}

export function PdfReadinessBadge({
  isReady,
  missingSectionCount,
  onFixClick,
}: PdfReadinessBadgeProps) {
  if (isReady) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          PDF Ready
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onFixClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
    >
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
        {missingSectionCount} {missingSectionCount === 1 ? "section" : "sections"} need attention
      </span>
      <Badge variant="outline" className="text-xs ml-1">
        Fix now
      </Badge>
    </button>
  );
}
