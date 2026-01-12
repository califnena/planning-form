import { usePlanContext } from "./PlannerLayout";
import { SectionInsurance } from "@/components/planner/sections/SectionInsurance";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * InsurancePage
 * 
 * CANONICAL KEY: insurance
 * Insurance policies and information
 * 
 * SECTION_ID: insurance
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function InsurancePage() {
  const { plan, updatePlan, saveState } = usePlanContext();

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
        <SectionInsurance data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="insurance" />
    </div>
  );
}
