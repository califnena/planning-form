import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Download, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrePlanningChecklistPDF } from "@/lib/preplanningChecklistPdfGenerator";
import { generateAfterDeathChecklistPDF } from "@/lib/afterDeathChecklistPdfGenerator";
import { useToast } from "@/hooks/use-toast";

export const ChecklistsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleDownload = async (type: 'pre-planning' | 'after-death') => {
    setGenerating(type);
    try {
      if (type === 'pre-planning') {
        await generatePrePlanningChecklistPDF();
      } else {
        await generateAfterDeathChecklistPDF();
      }
      toast({
        title: "PDF Downloaded",
        description: "Your checklist has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ListChecks className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Checklists</h3>
          <p className="text-sm text-muted-foreground">
            Download and use these checklists to stay organized
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Pre-Planning Checklist Card */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">✅</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Before Death
            </Badge>
          </div>
          <h4 className="font-semibold mb-1">Pre-Planning Checklist</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Track your planning progress with organized checkboxes for each section.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => handleDownload('pre-planning')}
              disabled={generating === 'pre-planning'}
            >
              <Download className="h-3 w-3" />
              {generating === 'pre-planning' ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1"
              onClick={() => navigate('/app?section=overview')}
            >
              View in App
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>

        {/* After-Death Checklist Card */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📋</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
              After Death
            </Badge>
          </div>
          <h4 className="font-semibold mb-1">After-Death Planner</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Timeline-based guide for loved ones with tasks organized by urgency.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => handleDownload('after-death')}
              disabled={generating === 'after-death'}
            >
              <Download className="h-3 w-3" />
              {generating === 'after-death' ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1"
              onClick={() => navigate('/after-death-planner')}
            >
              View in App
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
