import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarePreferencesData {
  preferences?: string[];
  additionalNotes?: string;
}

interface SectionCarePreferencesProps {
  data?: CarePreferencesData;
  onChange?: (data: CarePreferencesData) => void;
}

// Exact checkbox questions from requirements - one per line
const PREFERENCE_OPTIONS = [
  { id: "comfort_priority", label: "Comfort and pain relief are a priority" },
  { id: "avoid_aggressive", label: "Avoid aggressive treatment if recovery is unlikely" },
  { id: "healthcare_proxy", label: "Healthcare proxy should be involved" },
  { id: "prefer_home", label: "Prefer care at home if possible" },
  { id: "open_hospice", label: "Open to hospice care" },
  { id: "loved_ones_present", label: "Want loved ones present" },
  { id: "clear_explanations", label: "Want clear explanations" },
  { id: "spiritual_support", label: "Want spiritual or religious support" },
  { id: "additional_wishes", label: "Additional wishes matter" },
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
              Everything here is optional. Check what applies to you and skip anything that doesn't.
              This does not replace medical or legal documents.
            </p>
          </div>
        </div>
      </Card>

      {/* Preference Checkboxes - One per line, large square checkboxes (min 44px) */}
      <Card className="p-5 mb-6">
        <div className="space-y-4">
          {PREFERENCE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-4 cursor-pointer py-2"
            >
              <button
                type="button"
                className={cn(
                  "h-11 w-11 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                  isChecked(option.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground hover:border-primary"
                )}
                onClick={() => togglePreference(option.id)}
                aria-label={option.label}
              >
                {isChecked(option.id) && (
                  <svg
                    className="h-6 w-6 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked(option.id)}
                onChange={() => togglePreference(option.id)}
              />
              <span className="text-foreground text-base leading-relaxed">{option.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Optional Notes Field */}
      <Card className="p-5">
        <h3 className="text-lg font-medium text-foreground mb-3">Other preferences (optional)</h3>
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
