import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check, Info } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrePlanningItem {
  id: string;
  title: string;
  goToRoute: string;
  /** Optional "More info" internal link */
  moreInfoRoute?: string;
  moreInfoLabel?: string;
}

// EXACT checklist wording as specified - NO external Learn more links
// Internal "More info" links for Advance Directive and DNR/POLST only
const PRE_PLANNING_ITEMS: PrePlanningItem[] = [
  {
    id: "emergency_contacts",
    title: "Emergency contacts written down.",
    goToRoute: "/preplandashboard/contacts",
  },
  {
    id: "healthcare_proxy",
    title: "Healthcare decision-maker named.",
    goToRoute: "/preplandashboard/advance-directive",
  },
  {
    id: "care_preferences",
    title: "Care and comfort preferences noted.",
    goToRoute: "/preplandashboard/care-preferences",
  },
  {
    id: "advance_directive",
    title: "Advance Directive status.",
    goToRoute: "/preplandashboard/advance-directive",
    moreInfoRoute: "/resources#advance-directives",
    moreInfoLabel: "More info",
  },
  {
    id: "dnr_polst",
    title: "DNR / POLST status.",
    goToRoute: "/preplandashboard/advance-directive",
    moreInfoRoute: "/resources#dnr-polst",
    moreInfoLabel: "More info",
  },
  {
    id: "funeral_wishes",
    title: "Funeral or memorial wishes recorded.",
    goToRoute: "/preplandashboard/funeral-wishes",
  },
  {
    id: "travel_protection",
    title: "Travel / away-from-home protection reviewed.",
    goToRoute: "/preplandashboard/travel-planning",
  },
];

interface SectionPrePlanningProps {
  statuses?: Record<string, boolean>;
  onStatusChange?: (id: string, checked: boolean) => void;
}

export const SectionPrePlanning = ({ statuses: externalStatuses, onStatusChange }: SectionPrePlanningProps) => {
  const navigate = useNavigate();
  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedStatuses = localStorage.getItem("preplanning_checklist");
    if (savedStatuses) {
      setLocalStatuses(JSON.parse(savedStatuses));
    }
    const savedNotes = localStorage.getItem("preplanning_notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Auto-save notes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("preplanning_notes", JSON.stringify(notes));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  const statuses = externalStatuses || localStatuses;

  const toggleStatus = (id: string) => {
    const newChecked = !statuses[id];
    
    if (onStatusChange) {
      onStatusChange(id, newChecked);
    } else {
      const newStatuses = { ...localStatuses, [id]: newChecked };
      setLocalStatuses(newStatuses);
      localStorage.setItem("preplanning_checklist", JSON.stringify(newStatuses));
    }
  };

  const updateNote = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };

  const isChecked = (id: string) => !!statuses[id];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Pre-Planning Checklist
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are helpful things to think about. You can do them one at a time. Nothing is required.
        </p>
      </div>

      <div className="space-y-4">
        {PRE_PLANNING_ITEMS.map((item) => {
          const checked = isChecked(item.id);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "p-5 sm:p-6 transition-all border-2",
                checked && "border-green-200 bg-green-50/50 dark:bg-green-950/20",
                !checked && "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Large Square Checkbox - 44px minimum tap target */}
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={cn(
                    "flex-shrink-0 h-11 w-11 rounded-md border-2 flex items-center justify-center transition-all mt-0.5",
                    checked
                      ? "bg-green-600 border-green-600"
                      : "border-muted-foreground/50 hover:border-primary"
                  )}
                  aria-label={checked ? "Mark as not done" : "Mark as done"}
                >
                  {checked && (
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                      {item.title}
                    </h3>
                    {item.moreInfoRoute && (
                      <Link 
                        to={item.moreInfoRoute}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Info className="h-4 w-4" />
                        {item.moreInfoLabel}
                      </Link>
                    )}
                  </div>

                  {/* Go to section button - large touch target */}
                  <Button
                    variant="default"
                    size="default"
                    onClick={() => navigate(item.goToRoute)}
                    className="gap-2 h-12 px-5 text-base"
                  >
                    Go to section
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Optional notes field */}
                  <div className="pt-2">
                    <Textarea
                      value={notes[item.id] || ""}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      placeholder="Notes or reminders (optional)"
                      className="min-h-[60px] text-base resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
