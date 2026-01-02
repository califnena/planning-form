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

// Exact checkbox questions from the requirements - one per line
const PREFERENCE_OPTIONS = [
  { id: "comfort_focused", label: "I prefer comfort-focused care if seriously ill" },
  { id: "pain_managed", label: "I want pain managed even if it causes drowsiness" },
  { id: "stay_home", label: "I prefer to stay at home if possible" },
  { id: "hospital_care", label: "I prefer hospital care if needed" },
  { id: "family_present", label: "I want family present as much as possible" },
  { id: "limited_visitors", label: "I prefer limited visitors" },
  { id: "spiritual_support", label: "I want spiritual or religious support" },
  { id: "no_spiritual", label: "I do not want spiritual or religious care" },
  { id: "music_prayer_quiet", label: "I want music, prayer, or quiet time" },
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
            <p className="text-foreground">
              Everything here is optional. Check what applies to you and skip anything that doesn't.
              This does not replace medical or legal documents.
            </p>
          </div>
        </div>
      </Card>

      {/* Preference Checkboxes - One per line, large square checkboxes */}
      <Card className="p-5 mb-6">
        <div className="space-y-4">
          {PREFERENCE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-4 cursor-pointer py-2"
            >
              <div
                className={cn(
                  "h-7 w-7 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                  isChecked(option.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground hover:border-primary"
                )}
                onClick={() => togglePreference(option.id)}
              >
                {isChecked(option.id) && (
                  <svg
                    className="h-5 w-5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
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

      {/* Other Preferences - Short text field */}
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
