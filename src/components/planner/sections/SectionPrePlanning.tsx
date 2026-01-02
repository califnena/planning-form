import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrePlanningItem {
  id: string;
  title: string;
  goToRoute: string;
  learnMoreRoute: string;
}

// EXACT checklist wording as specified
const PRE_PLANNING_ITEMS: PrePlanningItem[] = [
  {
    id: "emergency_contacts",
    title: "I have written down who should be contacted in an emergency",
    goToRoute: "/preplandashboard?section=contacts",
    learnMoreRoute: "/resources?topic=contacts",
  },
  {
    id: "healthcare_proxy",
    title: "I have named someone to make medical decisions if needed",
    goToRoute: "/preplandashboard?section=healthcare",
    learnMoreRoute: "/resources?topic=healthcare-proxy",
  },
  {
    id: "care_preferences",
    title: "I have noted my care and comfort preferences",
    goToRoute: "/preplandashboard?section=healthcare",
    learnMoreRoute: "/resources?topic=care-preferences",
  },
  {
    id: "funeral_wishes",
    title: "I have recorded my funeral or memorial wishes",
    goToRoute: "/preplandashboard?section=funeral",
    learnMoreRoute: "/resources?topic=funeral-planning",
  },
  {
    id: "travel_protection",
    title: "I have reviewed travel or away-from-home protection",
    goToRoute: "/preplandashboard?section=travel",
    learnMoreRoute: "/travel-protection",
  },
  {
    id: "insurance_info",
    title: "I have listed important insurance information",
    goToRoute: "/preplandashboard?section=insurance",
    learnMoreRoute: "/resources?topic=insurance",
  },
  {
    id: "messages",
    title: "I have written messages or notes for loved ones",
    goToRoute: "/preplandashboard?section=messages",
    learnMoreRoute: "/resources?topic=messages",
  },
  {
    id: "documents_location",
    title: "I know where important documents are kept",
    goToRoute: "/preplandashboard?section=legal",
    learnMoreRoute: "/resources?topic=document-location",
  },
  {
    id: "plan_reviewed",
    title: "I have reviewed my plan and saved a printable copy",
    goToRoute: "/plan-summary",
    learnMoreRoute: "/resources",
  },
];

interface SectionPrePlanningProps {
  statuses?: Record<string, boolean>;
  onStatusChange?: (id: string, checked: boolean) => void;
}

export const SectionPrePlanning = ({ statuses: externalStatuses, onStatusChange }: SectionPrePlanningProps) => {
  const navigate = useNavigate();
  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preplanning_checklist");
    if (saved) {
      setLocalStatuses(JSON.parse(saved));
    }
  }, []);

  // Use external statuses if provided, otherwise use local
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

  const isChecked = (id: string) => !!statuses[id];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Pre-Planning Checklist
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are helpful things to think about. You can check off what you've already done or learn more when you're ready.
        </p>
      </div>

      <div className="space-y-3">
        {PRE_PLANNING_ITEMS.map((item) => {
          const checked = isChecked(item.id);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "p-4 sm:p-5 transition-all border-2",
                checked && "border-green-200 bg-green-50/50 dark:bg-green-950/20",
                !checked && "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Large Square Checkbox - 44px minimum tap target */}
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={cn(
                    "flex-shrink-0 h-11 w-11 rounded border-2 flex items-center justify-center transition-all mt-0.5",
                    checked
                      ? "bg-green-600 border-green-600"
                      : "border-muted-foreground/50 hover:border-primary"
                  )}
                  aria-label={checked ? "Mark as not done" : "Mark as done"}
                >
                  {checked && (
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                    {item.title}
                  </h3>

                  {/* Actions - large touch targets */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => navigate(item.learnMoreRoute)}
                      className="gap-2 h-11 px-4 text-base"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn more
                    </Button>
                    <Button
                      variant="default"
                      size="default"
                      onClick={() => navigate(item.goToRoute)}
                      className="gap-2 h-11 px-4 text-base"
                    >
                      Go to section
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
