import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Download, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlanData } from "@/hooks/usePlanData";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSectionsByGroup, type SectionDefinition } from "@/lib/sectionRegistry";
import { cn } from "@/lib/utils";
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
      {/* How the Planning Process Works - Orientation Section */}
      <div className="bg-[hsl(var(--senior-sage))] rounded-2xl p-6 md:p-8 mb-2">
        <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--senior-text))] mb-2 text-center">
          How the Planning Process Works
        </h2>
        <p className="text-[hsl(var(--senior-text-soft))] text-center mb-6 text-base">
          You are always in control. Nothing is required all at once.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm">
              1
            </div>
            <div className="pt-1.5">
              <p className="text-[hsl(var(--senior-text))] text-base">Choose what you want to include.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm">
              2
            </div>
            <div className="pt-1.5">
              <p className="text-[hsl(var(--senior-text))] text-base">Fill out only what applies.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm">
              3
            </div>
            <div className="pt-1.5">
              <p className="text-[hsl(var(--senior-text))] text-base">Save anytime and come back later.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg shadow-sm">
              4
            </div>
            <div className="pt-1.5">
              <p className="text-[hsl(var(--senior-text))] text-base">Print or share with your family when you are ready.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Planning Menu</h1>
        <p className="text-lg text-muted-foreground">
          Choose a section to record your wishes and important information.
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

      {/* Section Tiles with Icons */}
      <div className="space-y-6 pt-4">
        {/* About You Group */}
        <SectionGroup 
          title="About You" 
          group="aboutyou" 
          navigate={navigate}
          accentClass="bg-[hsl(var(--section-aboutyou))] border-l-4 border-l-[hsl(var(--section-aboutyou-border))]"
        />
        
        {/* Your Wishes Group */}
        <SectionGroup 
          title="Your Wishes" 
          group="yourwishes" 
          navigate={navigate}
          accentClass="bg-[hsl(var(--section-yourwishes))] border-l-4 border-l-[hsl(var(--section-yourwishes-border))]"
        />
        
        {/* Important Records Group */}
        <SectionGroup 
          title="Important Records" 
          group="records" 
          navigate={navigate}
          accentClass="bg-[hsl(var(--section-records))] border-l-4 border-l-[hsl(var(--section-records-border))]"
        />
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

// Section Group component with tiles
interface SectionGroupProps {
  title: string;
  group: SectionDefinition["group"];
  navigate: (path: string) => void;
  accentClass: string;
}

const SectionGroup = ({ title, group, navigate, accentClass }: SectionGroupProps) => {
  const sections = getSectionsByGroup(group);
  if (sections.length === 0) return null;

  return (
    <div className={cn("rounded-lg p-4", accentClass)}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="grid gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-base rounded-lg transition-all duration-200 text-left",
                "bg-background/80 hover:bg-background border border-border/50 hover:border-border",
                "text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1">{section.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
