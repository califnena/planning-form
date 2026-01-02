import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info, AlertTriangle, Plane, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TravelPlanningData {
  travelOvernight?: "yes" | "no" | "unsure";
  travelOutOfState?: "yes" | "no" | "unsure";
  emergencyContact?: string;
  hasProtectionPlan?: "yes" | "no" | "unsure";
  providerName?: string;
  notes?: string;
}

interface SectionTravelPlanningProps {
  data?: TravelPlanningData;
  onChange?: (data: TravelPlanningData) => void;
}

const STATUS_OPTIONS: { value: "yes" | "no" | "unsure"; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

// Example providers for education only
const EXAMPLE_PROVIDERS = [
  { name: "Medjet", type: "Membership", notes: "Medical transport focus" },
  { name: "MASA", type: "Membership", notes: "Medical + remains transport" },
  { name: "Global Rescue", type: "Membership", notes: "Medical evacuation" },
  { name: "Travel Guard", type: "Insurance", notes: "Trip insurance with options" },
];

export const SectionTravelPlanning = ({ data, onChange }: SectionTravelPlanningProps) => {
  // Use local state if no external control
  const [localData, setLocalData] = useState<TravelPlanningData>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("travel-planning-data");
    if (saved) {
      try {
        setLocalData(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing travel data:", e);
      }
    }
  }, []);

  const currentData = data !== undefined ? data : localData;

  const updateData = (updates: Partial<TravelPlanningData>) => {
    const newData = { ...currentData, ...updates };
    if (onChange) {
      onChange(newData);
    } else {
      setLocalData(newData);
      localStorage.setItem("travel-planning-data", JSON.stringify(newData));
    }
  };

  const renderStatusButtons = (
    fieldName: keyof TravelPlanningData,
    currentValue: "yes" | "no" | "unsure" | undefined
  ) => (
    <div className="flex flex-wrap gap-3">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => updateData({ [fieldName]: option.value })}
          className={cn(
            "h-12 px-6 rounded-lg border-2 text-base font-medium transition-all",
            currentValue === option.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Travel & Away-From-Home Plan
          </h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Plan ahead for emergencies that may happen while traveling.
        </p>
      </div>

      {/* Travel Questions */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">About Your Travel</h2>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base mb-3 block">Do you travel overnight?</Label>
            {renderStatusButtons("travelOvernight", currentData.travelOvernight)}
          </div>
          
          <div>
            <Label className="text-base mb-3 block">Do you travel out of state?</Label>
            {renderStatusButtons("travelOutOfState", currentData.travelOutOfState)}
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Emergency Contact</h2>
        <p className="text-muted-foreground mb-4">
          If something happened away from home, who should be called first?
        </p>
        
        <Input
          value={currentData.emergencyContact || ""}
          onChange={(e) => updateData({ emergencyContact: e.target.value })}
          placeholder="Name and phone number"
          className="text-base h-12"
        />
      </Card>

      {/* Protection Plan */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Travel Protection</h2>
        <p className="text-muted-foreground mb-4">
          Do you have a travel protection plan (for medical transport or remains)?
        </p>
        
        {renderStatusButtons("hasProtectionPlan", currentData.hasProtectionPlan)}
        
        {currentData.hasProtectionPlan === "yes" && (
          <div className="mt-4">
            <Label htmlFor="provider-name" className="text-base">Provider name (optional)</Label>
            <Input
              id="provider-name"
              value={currentData.providerName || ""}
              onChange={(e) => updateData({ providerName: e.target.value })}
              placeholder="e.g., Medjet, MASA, etc."
              className="mt-1 text-base h-12"
            />
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Additional Notes</h2>
        <Textarea
          value={currentData.notes || ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          placeholder="Any other travel planning notes..."
          className="min-h-[100px] text-base"
        />
      </Card>

      {/* Provider Examples */}
      <Card className="p-5 mb-6 bg-muted/30">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 mb-4 pb-4 border-b">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-foreground text-base">
            <strong>Important:</strong> These are examples only. We are not recommending any company and we are not affiliated. You can choose any provider.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-4">Example Providers</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 font-medium">Provider</th>
                <th className="text-left py-3 pr-4 font-medium">Type</th>
                <th className="text-left py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_PROVIDERS.map((provider) => (
                <tr key={provider.name} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-foreground">{provider.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{provider.type}</td>
                  <td className="py-3 text-muted-foreground">{provider.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Educational Info */}
      <Card className="p-4 bg-accent/30 border-accent/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground text-base">
              Travel protection helps cover the cost of bringing someone home if something happens while away. Medicare and regular health insurance usually do not cover this.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
