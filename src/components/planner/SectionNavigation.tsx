import { Button } from "@/components/ui/button";
import { ChevronRight, Download } from "lucide-react";
import { SaveAndBreakButton } from "./SaveAndBreakButton";

interface SectionNavigationProps {
  currentSection: string;
  onNext: () => void;
  onGenerateDocument?: () => void;
  isLastSection?: boolean;
  onSave?: () => Promise<void> | void;
}

export const SectionNavigation = ({
  currentSection,
  onNext,
  onGenerateDocument,
  isLastSection = false,
  onSave,
}: SectionNavigationProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t mt-8">
      <SaveAndBreakButton onSave={onSave} />
      
      <div className="flex gap-3">
        {isLastSection && onGenerateDocument ? (
          <Button onClick={onGenerateDocument} size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Generate My Document
          </Button>
        ) : (
          <Button onClick={onNext} size="lg" className="gap-2">
            Next Section
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
