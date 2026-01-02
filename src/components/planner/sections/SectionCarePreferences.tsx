import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarePreferencesData {
  preferences?: string[];
  additionalNotes?: string;
}

interface SectionCarePreferencesProps {
  data?: CarePreferencesData;
  onChange?: (data: CarePreferencesData) => void;
}

// EXACT checkbox questions from requirements - one per line, large square checkboxes
const PREFERENCE_OPTIONS = [
  { id: "comfort_priority", label: "I prefer comfort-focused care if recovery is unlikely." },
  { id: "family_contact", label: "I want my family contacted before major decisions are made (when possible)." },
  { id: "avoid_machines", label: "I prefer to avoid being kept alive by machines if there is no meaningful recovery." },
  { id: "pain_relief", label: "I prefer pain relief even if it may cause sleepiness." },
  { id: "stay_home", label: "I prefer to stay at home as long as it is safe and possible." },
  { id: "hospice_care", label: "If I cannot stay at home, I prefer hospice care when appropriate." },
  { id: "spiritual_support", label: "I want a faith leader or spiritual support contacted if I am very ill." },
  { id: "communication_needs", label: "I have communication needs (hearing, vision, language) I want caregivers to know." },
  { id: "mobility_needs", label: "I have mobility or assistance needs I want caregivers to know." },
];

export const SectionCarePreferences = ({ data = {}, onChange }: SectionCarePreferencesProps) => {
  const selectedPreferences = data.preferences || [];

  const togglePreference = (id: string) => {
    const updated = selectedPreferences.includes(id)
      ? selectedPreferences.filter((p) => p !== id)
      : [...selectedPreferences, id];
    onChange?.({ ...data, preferences: updated });
  };

  const isChecked = (id: string) => selectedPreferences.includes(id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Care Preferences
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These preferences help others care for you the way you would want if you are ill or recovering.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 bg-accent/30 border-accent/50 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground text-base">
              This is not medical advice. This is a simple summary for your family.
              Everything here is optional. Check what applies to you and skip anything that doesn't.
            </p>
          </div>
        </div>
      </Card>

      {/* Preference Checkboxes - One per line, large square checkboxes (44px min) */}
      <Card className="p-5 mb-6">
        <div className="space-y-4">
          {PREFERENCE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-4 cursor-pointer py-2"
            >
              <button
                type="button"
                className={cn(
                  "h-11 w-11 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5",
                  isChecked(option.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground hover:border-primary"
                )}
                onClick={() => togglePreference(option.id)}
                aria-label={option.label}
              >
                {isChecked(option.id) && (
                  <Check className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
                )}
              </button>
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked(option.id)}
                onChange={() => togglePreference(option.id)}
              />
              <span className="text-foreground text-base leading-relaxed pt-2">{option.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Optional Notes Field */}
      <Card className="p-5">
        <h3 className="text-lg font-medium text-foreground mb-3">Other care notes (optional)</h3>
        <Textarea
          value={data.additionalNotes || ""}
          onChange={(e) => onChange?.({ ...data, additionalNotes: e.target.value })}
          placeholder="Any other preferences you'd like to share..."
          rows={4}
          className="text-base"
        />
      </Card>
    </div>
  );
};
