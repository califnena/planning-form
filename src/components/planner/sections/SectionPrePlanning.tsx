import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Circle, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PrePlanningItem {
  id: string;
  title: string;
  description: string;
  learnMoreRoute: string;
  goToRoute: string;
  status: "completed" | "in_progress" | "not_started";
}

interface SectionPrePlanningProps {
  statuses?: Record<string, "completed" | "in_progress" | "not_started">;
  onStatusChange?: (id: string, status: "completed" | "in_progress" | "not_started") => void;
}

const PRE_PLANNING_ITEMS: Omit<PrePlanningItem, "status">[] = [
  {
    id: "advance_directive",
    title: "Advance Directive",
    description: "A document that explains your medical wishes if you cannot speak for yourself.",
    learnMoreRoute: "/resources?topic=advance-directive",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "dnr_polst",
    title: "DNR / POLST",
    description: "Lets others know if you have special medical orders and where they are kept.",
    learnMoreRoute: "/resources?topic=dnr-polst",
    goToRoute: "/preplandashboard/health-care",
  },
  {
    id: "health_care_overview",
    title: "Health & Care Overview",
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
    id: "insurance_overview",
    title: "Insurance Overview",
    description: "Helps your family know what coverage exists and where to find details.",
    learnMoreRoute: "/resources?topic=insurance",
    goToRoute: "/preplandashboard/insurance",
  },
  {
    id: "travel_protection",
    title: "Travel Death / Transport Protection",
    description: "Information to consider if death occurs away from home.",
    learnMoreRoute: "/resources?topic=travel-protection",
    goToRoute: "/travel-protection",
  },
];

const StatusIcon = ({ status }: { status: "completed" | "in_progress" | "not_started" }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "in_progress":
      return <Clock className="h-5 w-5 text-amber-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
};

const StatusLabel = ({ status }: { status: "completed" | "in_progress" | "not_started" }) => {
  switch (status) {
    case "completed":
      return <span className="text-green-600 font-medium">Completed</span>;
    case "in_progress":
      return <span className="text-amber-600 font-medium">In progress</span>;
    default:
      return <span className="text-muted-foreground">Not started</span>;
  }
};

export const SectionPrePlanning = ({ statuses = {}, onStatusChange }: SectionPrePlanningProps) => {
  const navigate = useNavigate();

  const getStatus = (id: string) => statuses[id] || "not_started";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Pre-Planning Checklist
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are the important areas to consider when planning ahead.<br />
          Take your time. You can update these anytime.
        </p>
      </div>

      <div className="space-y-4">
        {PRE_PLANNING_ITEMS.map((item) => {
          const status = getStatus(item.id);
          
          return (
            <Card
              key={item.id}
              className={cn(
                "p-5 transition-all border-2",
                status === "completed" && "border-green-200 bg-green-50/50",
                status === "in_progress" && "border-amber-200 bg-amber-50/50",
                status === "not_started" && "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <StatusIcon status={status} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {item.description}
                  </p>

                  {/* Status Selection */}
                  <div className="mb-4">
                    <RadioGroup
                      value={status}
                      onValueChange={(value) => onStatusChange?.(item.id, value as any)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id={`${item.id}-completed`} />
                        <Label htmlFor={`${item.id}-completed`} className="text-sm cursor-pointer">
                          Completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in_progress" id={`${item.id}-progress`} />
                        <Label htmlFor={`${item.id}-progress`} className="text-sm cursor-pointer">
                          In progress
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not_started" id={`${item.id}-not-started`} />
                        <Label htmlFor={`${item.id}-not-started`} className="text-sm cursor-pointer">
                          Not started
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(item.learnMoreRoute)}
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn more
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(item.goToRoute)}
                      className="gap-2"
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
