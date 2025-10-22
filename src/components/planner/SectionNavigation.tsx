import { Button } from "@/components/ui/button";
import { ChevronRight, Download } from "lucide-react";

interface SectionNavigationProps {
  currentSection: string;
  onNext: () => void;
  onGenerateDocument?: () => void;
  isLastSection?: boolean;
}

export const SectionNavigation = ({
  currentSection,
  onNext,
  onGenerateDocument,
  isLastSection = false,
}: SectionNavigationProps) => {
  return (
    <div className="flex justify-end pt-6 border-t mt-8">
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
  );
};
