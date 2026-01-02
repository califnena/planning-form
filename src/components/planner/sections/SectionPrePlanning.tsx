import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrePlanningItem {
  id: string;
  title: string;
  goToRoute: string;
}

// EXACT checklist wording as specified - NO Learn more links
const PRE_PLANNING_ITEMS: PrePlanningItem[] = [
  {
    id: "emergency_contacts",
    title: "I wrote down who to contact in an emergency.",
    goToRoute: "/preplandashboard/contacts",
  },
  {
    id: "healthcare_proxy",
    title: "I chose someone to make medical decisions if I cannot.",
    goToRoute: "/preplandashboard/advance-directive",
  },
  {
    id: "care_preferences",
    title: "I noted my care and comfort preferences.",
    goToRoute: "/preplandashboard/care-preferences",
  },
  {
    id: "medications",
    title: "I listed my medicines and allergies.",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "conditions",
    title: "I listed major health conditions doctors should know about.",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "doctor_pharmacy",
    title: "I wrote down my doctor and pharmacy information.",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "insurance_info",
    title: "I noted where my insurance card and details are kept.",
    goToRoute: "/preplandashboard/insurance",
  },
  {
    id: "funeral_wishes",
    title: "I recorded my funeral or memorial wishes.",
    goToRoute: "/preplandashboard/funeral-wishes",
  },
  {
    id: "advance_directive",
    title: "I reviewed Advance Directive and DNR/POLST status.",
    goToRoute: "/preplandashboard/advance-directive",
  },
  {
    id: "travel_protection",
    title: "I reviewed travel or away-from-home protection.",
    goToRoute: "/preplandashboard/travel-planning",
  },
  {
    id: "plan_reviewed",
    title: "I reviewed my plan and saved a printable copy.",
    goToRoute: "/preplan-summary",
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
                  <h3 className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                    {item.title}
                  </h3>

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
