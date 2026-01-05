import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Download, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlanData } from "@/hooks/usePlanData";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SectionOverviewProps {
  onNavigateToChecklist?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const SectionOverview = ({ onNavigateToSection }: SectionOverviewProps) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { plan, loading, saveState } = usePlanData(userId || "");

  // Calculate progress from plan data - IDs must match sectionIdToRoute in OverviewPage
  const sections = [
    { id: "legacy", label: "About Me", field: "about_me_notes" },
    { id: "funeral", label: "Funeral Wishes", field: "funeral_wishes_notes" },
    { id: "legal", label: "Legal", field: "legal_notes" },
    { id: "financial", label: "Financial", field: "financial_notes" },
    { id: "insurance", label: "Insurance", field: "insurance_notes" },
    { id: "digital", label: "Digital", field: "digital_notes" },
    { id: "pets", label: "Pets", field: "pets_notes" },
    { id: "property", label: "Property", field: "property_notes" },
    { id: "messages", label: "Messages", field: "messages_notes" },
    { id: "instructions", label: "Instructions", field: "instructions_notes" },
  ];

  const completedSections = plan ? sections.filter(s => {
    const value = plan[s.field as keyof typeof plan];
    return value && String(value).trim().length > 0;
  }).length : 0;

  const totalSections = sections.length;
  const progressPercent = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  // Find first incomplete section for "continue" action
  const firstIncompleteSection = plan ? sections.find(s => {
    const value = plan[s.field as keyof typeof plan];
    return !value || String(value).trim().length === 0;
  }) : sections[0];

  const lastUpdated = saveState.lastSaved;

  const handleContinuePlanning = () => {
    if (firstIncompleteSection && onNavigateToSection) {
      onNavigateToSection(firstIncompleteSection.id);
    } else if (onNavigateToSection) {
      // If all sections complete, go to the first one
      onNavigateToSection("legacy");
    } else {
      navigate('/preplandashboard/life-story');
    }
  };

  const handleViewSummary = () => {
    if (completedSections > 0) {
      navigate('/preplan-summary');
    } else {
      toast({
        title: "No planning data yet",
        description: "Complete at least one section to generate your summary.",
      });
      navigate('/preplandashboard/life-story');
    }
  };

  const handlePrintable = () => {
    // Route to PDF Preview page - it handles print/download
    navigate('/preplan-summary');
  };

  if (!userId || loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-sm text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your progress is saved automatically.
        </p>
      </div>

      {/* Primary Action */}
      <Button 
        onClick={handleContinuePlanning} 
        size="lg" 
        className="w-full gap-2"
      >
        Continue Planning
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleViewSummary} 
          variant="outline" 
          className="flex-1 gap-2"
        >
          <FileText className="h-4 w-4" />
          View Summary
        </Button>
        <Button 
          onClick={handlePrintable} 
          variant="outline" 
          className="flex-1 gap-2"
        >
          <Download className="h-4 w-4" />
          Printable Version
        </Button>
      </div>

      {/* Help Link */}
      <div className="pt-4 text-center">
        <button 
          onClick={() => navigate('/care-support')}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <Heart className="h-3.5 w-3.5" />
          Need help? Compassionate Guidance
        </button>
      </div>
    </div>
  );
};
