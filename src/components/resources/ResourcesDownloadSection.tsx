import { useState } from "react";
import { ResourceCard } from "./ResourceCard";
import { EFA_DOCUMENTS } from "@/lib/resourceDocuments";
import { generateReferenceGuidePDF } from "@/lib/referenceGuidePdfGenerator";
import { generatePrePlanningChecklistPDF } from "@/lib/preplanningChecklistPdfGenerator";
import { generateAfterDeathChecklistPDF } from "@/lib/afterDeathChecklistPdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

export const ResourcesDownloadSection = () => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadPDF = async (documentId: string) => {
    setGeneratingId(documentId);
    try {
      switch (documentId) {
        case 'reference-guide':
          await generateReferenceGuidePDF();
          break;
        case 'pre-planning-checklist':
          await generatePrePlanningChecklistPDF();
          break;
        case 'after-death-planner':
          await generateAfterDeathChecklistPDF();
          break;
      }
      toast({
        title: "PDF Generated",
        description: "Your document has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileDown className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Resources & Downloads</h2>
          <p className="text-sm text-muted-foreground">
            Essential documents to guide you through end-of-life planning
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {EFA_DOCUMENTS.map((doc) => (
          <ResourceCard
            key={doc.id}
            document={doc}
            onDownloadPDF={() => handleDownloadPDF(doc.id)}
            isGenerating={generatingId === doc.id}
          />
        ))}
      </div>

      <div className="p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
        <p>
          <strong>Tip:</strong> The Reference Guide explains each section in detail. 
          Use the Pre-Planning Checklist to track your progress, and share the After-Death 
          Planner with your executor or trusted contacts.
        </p>
      </div>
    </div>
  );
};
