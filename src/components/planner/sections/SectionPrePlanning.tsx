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

const PRE_PLANNING_ITEMS: PrePlanningItem[] = [
  {
    id: "advance_directive",
    title: "Advance Directive (Living Will)",
    description: "A document that explains your medical wishes if you cannot speak for yourself.",
    learnMoreRoute: "/resources?topic=advance-directive",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "healthcare_proxy",
    title: "Healthcare Proxy",
    description: "Names the person who can make medical decisions for you if needed.",
    learnMoreRoute: "/resources?topic=healthcare-proxy",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "dnr_polst",
    title: "DNR or POLST",
    description: "Lets others know if you have special medical orders and where they are kept.",
    learnMoreRoute: "/resources?topic=dnr-polst",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "medical_information",
    title: "Medical Information Summary",
    description: "A summary of health information your family and caregivers may need.",
    learnMoreRoute: "/resources?topic=health-overview",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "care_preferences",
    title: "Care Preferences",
    description: "Helps others understand how you want to be cared for and what matters to you.",
    learnMoreRoute: "/resources?topic=care-preferences",
    goToRoute: "/preplandashboard/care-preferences",
  },
  {
    id: "funeral_wishes",
    title: "Funeral Wishes",
    description: "Your preferences for services, burial or cremation, and final arrangements.",
    learnMoreRoute: "/resources?topic=funeral-planning",
    goToRoute: "/preplandashboard/funeral",
  },
  {
    id: "travel_protection",
    title: "Travel Death Protection",
    description: "Information to consider if death occurs away from home.",
    learnMoreRoute: "/resources?topic=travel-protection",
    goToRoute: "/travel-protection",
  },
  {
    id: "important_documents",
    title: "Important Documents Location",
    description: "Where to find wills, deeds, insurance papers, and other key documents.",
    learnMoreRoute: "/resources?topic=document-location",
    goToRoute: "/preplandashboard/legal",
  },
];

const StatusIcon = ({ status, isChecked }: { status: "completed" | "not_started"; isChecked: boolean }) => {
  if (isChecked) {
    return <CheckCircle2 className="h-6 w-6 text-green-600" />;
  }
  return <Circle className="h-6 w-6 text-muted-foreground/50" />;
};

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
                {/* Large Square Checkbox */}
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={cn(
                    "flex-shrink-0 h-7 w-7 rounded border-2 flex items-center justify-center transition-all mt-0.5",
                    checked
                      ? "bg-green-600 border-green-600"
                      : "border-muted-foreground/50 hover:border-primary"
                  )}
                  aria-label={checked ? "Mark as not done" : "Mark as done"}
                >
                  {checked && (
                    <svg
                      className="h-5 w-5 text-white"
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
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-base mb-3">
                    {item.description}
                  </p>

                  {/* Status text */}
                  <p className="text-sm mb-3">
                    {checked ? (
                      <span className="text-green-600 font-medium">Done</span>
                    ) : (
                      <span className="text-muted-foreground">Not done</span>
                    )}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(item.learnMoreRoute)}
                      className="gap-2 h-10 px-4"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn more
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(item.goToRoute)}
                      className="gap-2 h-10 px-4"
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
