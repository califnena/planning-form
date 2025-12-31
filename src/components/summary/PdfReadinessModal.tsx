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
import { ArrowRight, CheckCircle2, FileText, Download, Printer, Mail, Info, Edit } from "lucide-react";
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
            Almost Ready
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {hasHardRequired 
              ? "A couple of key details are needed to create your document. This only takes a moment."
              : "Your document is ready! A few optional items are blank—you can add them now or leave them for later."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[350px] pr-4">
          <div className="space-y-4 py-2">
            {/* Hard Required Section - Friendly language */}
            {hardRequiredItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Please add these details</span>
                </div>
                {Object.entries(groupedMissing)
                  .filter(([key]) => hardRequiredItems.some(h => h.sectionKey === key))
                  .map(([sectionKey, section]) => (
                    <div key={sectionKey} className="border border-primary/30 rounded-lg p-4 bg-primary/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">
                          {section.sectionLabel}
                        </h4>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleGoToSection(section.fixRoute)}
                          className="gap-1 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                          Add Now
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {section.items
                          .filter(item => item.severity === "hard")
                          .map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-muted-foreground">{item.message}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}

            {/* Recommended Section - Very soft language */}
            {recommendedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-sm">Optional — you can add these anytime</span>
                </div>
                {Object.entries(groupedMissing)
                  .filter(([key]) => recommendedItems.some(r => r.sectionKey === key))
                  .map(([sectionKey, section]) => (
                    <div key={sectionKey} className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">
                          {section.sectionLabel}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGoToSection(section.fixRoute)}
                          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Add details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {section.items
                          .filter(item => item.severity === "recommended")
                          .map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              {item.message}
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
              You can create your document now. Optional items will be left blank.
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
                Create my document with blank spaces for optional items
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("download")}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("print")}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!bypassConfirmed}
                  onClick={() => handleDraftAction("email")}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reassurance message */}
        <Alert className="mt-2 border-muted bg-muted/30">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-muted-foreground text-sm">
            <strong>You're doing great.</strong> You can come back and update your document anytime.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            I'll do this later
          </Button>
          {hasHardRequired && (
            <Button onClick={() => handleGoToSection(hardRequiredItems[0]?.fixRoute || "/preplandashboard")} className="gap-2">
              Add Missing Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Small badge component to show PDF readiness status - friendlier language
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
          Ready to print
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onFixClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
    >
      <Info className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">
        {missingSectionCount} {missingSectionCount === 1 ? "section" : "sections"} incomplete
      </span>
      <Badge variant="outline" className="text-xs ml-1">
        Optional
      </Badge>
    </button>
  );
}
