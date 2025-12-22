import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, AlertCircle, CheckCircle2, FileText, Download, Printer, Mail, AlertTriangle } from "lucide-react";
import type { MissingField } from "@/hooks/usePdfValidation";

interface PdfReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missing: MissingField[];
  hasHardRequired: boolean;
  canBypass: boolean;
  onFixItems: () => void;
  onDownloadDraft: () => void;
  onPrintDraft: () => void;
  onEmailDraft: () => void;
}

export function PdfReadinessModal({
  open,
  onOpenChange,
  missing,
  hasHardRequired,
  canBypass,
  onFixItems,
  onDownloadDraft,
  onPrintDraft,
  onEmailDraft,
}: PdfReadinessModalProps) {
  const navigate = useNavigate();
  const [bypassConfirmed, setBypassConfirmed] = useState(false);

  // Reset checkbox when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setBypassConfirmed(false);
    }
    onOpenChange(isOpen);
  };

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
    handleOpenChange(false);
    navigate(route);
  };

  const handleGoFixAll = () => {
    handleOpenChange(false);
    onFixItems();
    // Navigate to first missing section (prioritize personal)
    const personalMissing = missing.find(m => m.sectionKey === "personal");
    if (personalMissing) {
      navigate(personalMissing.fixRoute);
    } else if (missing.length > 0) {
      navigate(missing[0].fixRoute);
    }
  };

  const handleDraftAction = (action: "download" | "print" | "email") => {
    handleOpenChange(false);
    if (action === "download") {
      onDownloadDraft();
    } else if (action === "print") {
      onPrintDraft();
    } else {
      onEmailDraft();
    }
  };

  // Separate hard required from recommended
  const hardRequiredItems = missing.filter(m => m.severity === "hard");
  const recommendedItems = missing.filter(m => m.severity === "recommended");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Before We Create Your PDF
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {hasHardRequired 
              ? "Some required information is missing. Please add it before creating your PDF."
              : "A few items are missing. You can add them now, or create a draft with blank spaces."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[350px] pr-4">
          <div className="space-y-4 py-2">
            {/* Hard Required Section */}
            {hardRequiredItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-destructive text-sm">Required (cannot skip)</span>
                </div>
                {Object.entries(groupedMissing)
                  .filter(([key]) => hardRequiredItems.some(h => h.sectionKey === key))
                  .map(([sectionKey, section]) => (
                    <div key={sectionKey} className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
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
                        {section.items
                          .filter(item => item.severity === "hard")
                          .map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{item.message}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}

            {/* Recommended Section */}
            {recommendedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Recommended</span>
                </div>
                {Object.entries(groupedMissing)
                  .filter(([key]) => recommendedItems.some(r => r.sectionKey === key))
                  .map(([sectionKey, section]) => (
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
                        {section.items
                          .filter(item => item.severity === "recommended")
                          .map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{item.message}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bypass section - only show if canBypass */}
        {canBypass && (
          <div className="border-t pt-4 mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              You can still create a draft now. Missing items will be left blank.
            </p>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="bypass-confirm"
                checked={bypassConfirmed}
                onCheckedChange={(checked) => setBypassConfirmed(checked === true)}
              />
              <label
                htmlFor="bypass-confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I understand some items will be blank.
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Create a Draft Anyway
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("download")}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Draft PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("print")}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Draft
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("email")}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Draft Copy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tip alert - only if not showing bypass */}
        {!canBypass && (
          <Alert className="mt-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Tip:</strong> You can choose "Unsure" or "Not decided yet" for any field — that still counts as complete.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
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
