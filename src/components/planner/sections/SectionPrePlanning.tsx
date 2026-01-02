import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrePlanningItem {
  id: string;
  title: string;
  description: string;
  learnMoreRoute: string;
  goToRoute: string;
}

interface SectionPrePlanningProps {
  statuses?: Record<string, "completed" | "not_started">;
  onStatusChange?: (id: string, status: "completed" | "not_started") => void;
}

// Updated checklist with exact wording from requirements
const PRE_PLANNING_ITEMS: PrePlanningItem[] = [
  {
    id: "emergency_contacts",
    title: "I have written down who should be contacted in an emergency",
    description: "List emergency contacts so family knows who to call.",
    learnMoreRoute: "/resources?topic=contacts",
    goToRoute: "/preplandashboard/contacts",
  },
  {
    id: "healthcare_proxy",
    title: "I have named someone to make medical decisions if needed",
    description: "Choose a healthcare proxy to speak for you.",
    learnMoreRoute: "/resources?topic=healthcare-proxy",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "care_preferences",
    title: "I have noted my care and comfort preferences",
    description: "Share how you want to be cared for.",
    learnMoreRoute: "/resources?topic=care-preferences",
    goToRoute: "/preplandashboard/care-preferences",
  },
  {
    id: "funeral_wishes",
    title: "I have recorded my funeral or memorial wishes",
    description: "Let your family know your wishes for services.",
    learnMoreRoute: "/resources?topic=funeral-planning",
    goToRoute: "/preplandashboard/funeral-wishes",
  },
  {
    id: "insurance_info",
    title: "I have listed important insurance information",
    description: "Note insurance policies your family may need.",
    learnMoreRoute: "/resources?topic=insurance",
    goToRoute: "/preplandashboard/insurance",
  },
  {
    id: "messages",
    title: "I have written messages or notes for loved ones",
    description: "Leave personal messages for family and friends.",
    learnMoreRoute: "/resources?topic=messages",
    goToRoute: "/preplandashboard/messages",
  },
  {
    id: "documents_location",
    title: "I know where important documents are kept",
    description: "Document where to find wills, deeds, and papers.",
    learnMoreRoute: "/resources?topic=document-location",
    goToRoute: "/preplandashboard/legal-docs",
  },
  {
    id: "plan_reviewed",
    title: "I have reviewed my plan and saved a printable copy",
    description: "Review everything and create your printable document.",
    learnMoreRoute: "/resources",
    goToRoute: "/plan-summary",
  },
];

export const SectionPrePlanning = ({ statuses = {}, onStatusChange }: SectionPrePlanningProps) => {
  const navigate = useNavigate();

  const getStatus = (id: string) => statuses[id] || "not_started";
  const isChecked = (id: string) => getStatus(id) === "completed";

  const toggleStatus = (id: string) => {
    const currentStatus = getStatus(id);
    const newStatus = currentStatus === "completed" ? "not_started" : "completed";
    onStatusChange?.(id, newStatus);
  };

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
                checked && "border-green-200 bg-green-50/50",
                !checked && "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Large Square Checkbox - min 44px tap target */}
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
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-base mb-3">
                    {item.description}
                  </p>

                  {/* Status text */}
                  <p className="text-base mb-3">
                    {checked ? (
                      <span className="text-green-600 font-medium">Done</span>
                    ) : (
                      <span className="text-muted-foreground">Not done</span>
                    )}
                  </p>

                  {/* Actions - large touch targets */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => navigate(item.learnMoreRoute)}
                      className="gap-2 h-11 px-4"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn more
                    </Button>
                    <Button
                      variant="default"
                      size="default"
                      onClick={() => navigate(item.goToRoute)}
                      className="gap-2 h-11 px-4"
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
