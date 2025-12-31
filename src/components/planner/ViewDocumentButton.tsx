import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

/**
 * A visible button for seniors to access their planning document from within planner sections.
 * Does NOT auto-generate - just navigates to the summary/document page.
 */
export function ViewDocumentButton() {
  const navigate = useNavigate();

  return (
    <div className="bg-senior-sage/30 border border-senior-sage/50 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/preplan-summary")}
          className="gap-2 bg-white hover:bg-senior-cream border-primary/30 text-primary font-medium"
        >
          <FileText className="h-4 w-4" />
          👉 View My Planning Document
        </Button>
        <p className="text-sm text-muted-foreground">
          You can view or print your full plan at any time. You do not need to finish everything first.
        </p>
      </div>
    </div>
  );
}
