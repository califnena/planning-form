import { usePlanContext } from "./PlannerLayout";
import { SectionHealthCare } from "@/components/planner/sections/SectionHealthCare";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useEffect } from "react";

/**
 * HealthCarePage
 * 
 * CANONICAL KEY: healthcare
 * Health care and medical information
 * 
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function HealthCarePage() {
  const { user, plan, updatePlan, saveState } = usePlanContext();

  // Read from DB-backed plan_payload (single source of truth)
  const healthCareData = plan.healthcare || {};

  // One-time migration: if user has legacy localStorage data but nothing in plan_payload yet
  useEffect(() => {
    if (!user?.id) return;
    if (healthCareData && Object.keys(healthCareData).length > 0) return;

    const stored = localStorage.getItem(`health_care_${user.id}`);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        updatePlan({ healthcare: parsed });
      }
    } catch (e) {
      console.error("Error parsing health care data:", e);
    }
  }, [user?.id, updatePlan]);

  const handleChange = (data: any) => {
    updatePlan({ healthcare: data });
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
        <SectionHealthCare data={healthCareData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="health-care" />
    </div>
  );
}
