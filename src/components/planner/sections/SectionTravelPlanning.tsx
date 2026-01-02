import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ExternalLink, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface TravelPlanningData {
  travelAway: boolean;
  hasCoverage: boolean;
  unsureCoverage: boolean;
  noCoverage: boolean;
  notes: string;
}

const PROVIDERS = [
  { name: "Medjet", url: "https://medjet.com" },
  { name: "AirMedCare Network", url: "https://airmedcarenetwork.com" },
  { name: "MASA Global", url: "https://masaglobal.com" },
  { name: "Global Rescue", url: "https://globalrescue.com" },
  { name: "Seven Corners", url: "https://sevencorners.com" },
  { name: "Travelex Insurance", url: "https://travelexinsurance.com" },
];

export const SectionTravelPlanning = () => {
  const [formData, setFormData] = useState<TravelPlanningData>({
    travelAway: false,
    hasCoverage: false,
    unsureCoverage: false,
    noCoverage: false,
    notes: "",
  });

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("travel-planning-data");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  // Auto-save on change
  useEffect(() => {
    localStorage.setItem("travel-planning-data", JSON.stringify(formData));
  }, [formData]);

  const toggleCheckbox = (field: keyof Omit<TravelPlanningData, 'notes'>) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const updateNotes = (value: string) => {
    setFormData(prev => ({ ...prev, notes: value }));
  };

  // Derive status
  const getStatus = () => {
    if (formData.hasCoverage) return "Coverage noted";
    if (formData.travelAway || formData.unsureCoverage || formData.noCoverage || formData.notes) return "Reviewed";
    return "Not reviewed";
  };

  const status = getStatus();

  const checkboxItems = [
    { id: "travelAway", label: "I travel or spend time away from home" },
    { id: "hasCoverage", label: "I have travel or transport coverage" },
    { id: "unsureCoverage", label: "I am not sure if I have coverage" },
    { id: "noCoverage", label: "I do not have coverage" },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Travel & Away-From-Home Planning
            </h1>
          </div>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          If something happens while you are traveling or away from home, this helps your family know what to do.
        </p>
      </div>

      {/* Status Indicator */}
      <Card className={cn(
        "p-4 mb-6 border-2",
        status === "Coverage noted" && "border-green-200 bg-green-50/50 dark:bg-green-950/20",
        status === "Reviewed" && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20",
        status === "Not reviewed" && "border-border"
      )}>
        <div className="flex items-center gap-3">
          <span className="text-base font-medium">Status:</span>
          <span className={cn(
            "text-base font-semibold",
            status === "Coverage noted" && "text-green-700 dark:text-green-400",
            status === "Reviewed" && "text-amber-700 dark:text-amber-400",
            status === "Not reviewed" && "text-muted-foreground"
          )}>
            {status}
          </span>
        </div>
      </Card>

      {/* Checkboxes */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Travel Situation</h2>
        
        <div className="space-y-4">
          {checkboxItems.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleCheckbox(item.id)}
              className="flex items-center gap-4 w-full text-left group"
            >
              {/* Large Square Checkbox - 44px minimum tap target */}
              <div
                className={cn(
                  "flex-shrink-0 h-11 w-11 rounded border-2 flex items-center justify-center transition-all",
                  formData[item.id]
                    ? "bg-green-600 border-green-600"
                    : "border-muted-foreground/50 group-hover:border-primary"
                )}
              >
                {formData[item.id] && (
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
              </div>
              <span className="text-base sm:text-lg text-foreground">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Notes Field */}
        <div className="mt-6">
          <Label htmlFor="travel-notes" className="text-base font-medium mb-2 block">
            Where to find coverage details or who to contact (optional)
          </Label>
          <Textarea
            id="travel-notes"
            value={formData.notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="e.g., Policy is in the filing cabinet, call my insurance agent at..."
            className="text-base min-h-[100px]"
          />
        </div>
      </Card>

      {/* Provider Examples - Collapsed */}
      <Card className="p-6 mb-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="providers" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-0">
              Example providers (for reference only)
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {/* Disclaimer */}
              <div className="p-4 mb-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-base text-muted-foreground">
                    These are examples only. We do not recommend, sell, or have any affiliation with these providers. You may choose any provider or make your own arrangements.
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {PROVIDERS.map((provider) => (
                  <li key={provider.name}>
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-base text-primary hover:underline"
                    >
                      {provider.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};
