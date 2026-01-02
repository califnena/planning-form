import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarePreferencesData {
  comfortPainCare?: string[];
  careSetting?: string[];
  visitorsCompanionship?: string[];
  spiritualCultural?: string[];
  communicationPreferences?: string[];
  personalComfortItems?: string[];
  additionalNotes?: string;
}

interface SectionCarePreferencesProps {
  data?: CarePreferencesData;
  onChange?: (data: CarePreferencesData) => void;
}

interface CheckboxOption {
  id: string;
  label: string;
}

interface PreferenceCategory {
  id: keyof CarePreferencesData;
  title: string;
  options: CheckboxOption[];
}

const PREFERENCE_CATEGORIES: PreferenceCategory[] = [
  {
    id: "comfortPainCare",
    title: "1. Comfort & Pain Care",
    options: [
      { id: "comfort_over_treatment", label: "Comfort is more important to me than aggressive treatment" },
      { id: "pain_control", label: "Keeping pain under control is important to me" },
      { id: "keep_comfortable", label: "I want to be kept as comfortable as possible" },
    ],
  },
  {
    id: "careSetting",
    title: "2. Care Setting",
    options: [
      { id: "prefer_home", label: "I prefer to be at home if possible" },
      { id: "hospital_ok", label: "I am comfortable receiving care in a hospital" },
      { id: "hospice_ok", label: "I am comfortable receiving care in hospice" },
    ],
  },
  {
    id: "visitorsCompanionship",
    title: "3. Visitors & Companionship",
    options: [
      { id: "family_nearby", label: "I want family nearby when possible" },
      { id: "quiet_environment", label: "I prefer a quiet environment" },
      { id: "pets_important", label: "Pets are important to my comfort" },
    ],
  },
  {
    id: "spiritualCultural",
    title: "4. Spiritual or Cultural Preferences",
    options: [
      { id: "spiritual_support", label: "Spiritual or religious support is important to me" },
      { id: "cultural_traditions", label: "Cultural traditions should be respected" },
      { id: "music_prayer_readings", label: "Music, prayer, or readings bring me comfort" },
    ],
  },
  {
    id: "communicationPreferences",
    title: "5. Communication Preferences",
    options: [
      { id: "speak_slowly", label: "Speak slowly and clearly" },
      { id: "simple_terms", label: "Explain things in simple terms" },
      { id: "one_at_a_time", label: "I prefer one person to speak at a time" },
      { id: "written_info", label: "Written information helps me" },
    ],
  },
  {
    id: "personalComfortItems",
    title: "6. Personal Comfort Items",
    options: [
      { id: "blanket_clothing", label: "Favorite blanket or clothing" },
      { id: "music_sounds", label: "Preferred music or sounds" },
      { id: "lighting", label: "Lighting preferences" },
    ],
  },
];

export const SectionCarePreferences = ({ data = {}, onChange }: SectionCarePreferencesProps) => {
  const toggleOption = (categoryId: keyof CarePreferencesData, optionId: string) => {
    const current = (data[categoryId] as string[]) || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange?.({ ...data, [categoryId]: updated });
  };

  const isChecked = (categoryId: keyof CarePreferencesData, optionId: string) => {
    return ((data[categoryId] as string[]) || []).includes(optionId);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Care Preferences
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These preferences help caregivers and loved ones understand what matters to you.<br />
          This does not replace medical or legal documents.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 bg-accent/30 border-accent/50 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground">
              Everything here is optional. Check what applies to you and skip anything that doesn't.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {PREFERENCE_CATEGORIES.map((category) => (
          <Card key={category.id} className="p-5">
            <h3 className="text-lg font-medium text-foreground mb-4">{category.title}</h3>
            <div className="space-y-4">
              {category.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-start gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    isChecked(category.id, option.id)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/40"
                  )}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={cn(
                        "h-6 w-6 rounded border-2 flex items-center justify-center transition-all",
                        isChecked(category.id, option.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {isChecked(category.id, option.id) && (
                        <svg
                          className="h-4 w-4 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked(category.id, option.id)}
                    onChange={() => toggleOption(category.id, option.id)}
                  />
                  <span className="text-foreground leading-relaxed">{option.label}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}

        {/* Additional Notes */}
        <Card className="p-5">
          <h3 className="text-lg font-medium text-foreground mb-3">Additional Notes (Optional)</h3>
          <p className="text-muted-foreground mb-4">
            Is there anything else you'd like caregivers to know about your preferences?
          </p>
          <Textarea
            value={data.additionalNotes || ""}
            onChange={(e) => onChange?.({ ...data, additionalNotes: e.target.value })}
            placeholder="Any other preferences or notes..."
            rows={4}
            className="text-base"
          />
        </Card>
      </div>
    </div>
  );
};
