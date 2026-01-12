import { usePlanContext } from "./PlannerLayout";
import { SectionCarePreferences } from "@/components/planner/sections/SectionCarePreferences";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useEffect } from "react";

/**
 * CarePreferencesPage
 * 
 * CANONICAL KEY: care_preferences
 * Care and comfort preferences
 * 
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function CarePreferencesPage() {
  const { user, plan, updatePlan, saveState } = usePlanContext();

  const carePreferencesData = plan.care_preferences || {};

  // One-time migration from legacy localStorage
  useEffect(() => {
    if (!user?.id) return;
    if (carePreferencesData && Object.keys(carePreferencesData).length > 0) return;

    const stored = localStorage.getItem(`care_preferences_${user.id}`);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        updatePlan({ care_preferences: parsed });
      }
    } catch (e) {
      console.error("Error parsing care preferences data:", e);
    }
  }, [user?.id, updatePlan]);

  const handleChange = (data: any) => {
    updatePlan({ care_preferences: data });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <PreviewModeWrapper>
        <SectionCarePreferences data={carePreferencesData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="care-preferences" />
    </div>
  );
}
