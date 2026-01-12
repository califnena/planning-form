import { usePlanContext } from "./PlannerLayout";
import { SectionTravelPlanning } from "@/components/planner/sections/SectionTravelPlanning";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useEffect } from "react";

/**
 * TravelPlanningPage
 * 
 * CANONICAL KEY: travel
 * Travel and away-from-home planning
 * 
 * SECTION_ID: travel
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function TravelPlanningPage() {
  const { user, plan, updatePlan, saveState } = usePlanContext();

  // Read from DB-backed plan_payload (single source of truth)
  const travelData = plan.travel || {};

  // One-time migration: if user has legacy localStorage data but nothing in plan_payload yet
  useEffect(() => {
    if (!user?.id) return;
    if (travelData && Object.keys(travelData).length > 0) return;

    const stored = localStorage.getItem(`travel_planning_${user.id}`);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        updatePlan({ travel: parsed });
      }
    } catch (e) {
      console.error("Error parsing travel data:", e);
    }
  }, [user?.id, updatePlan]);

  const handleChange = (data: any) => {
    updatePlan({ travel: data });
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
        <SectionTravelPlanning data={travelData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="travel" />
    </div>
  );
}
