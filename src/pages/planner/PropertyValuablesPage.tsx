import { usePlanContext } from "./PlannerLayout";
import { SectionProperty } from "@/components/planner/sections/SectionProperty";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * PropertyValuablesPage
 * 
 * CANONICAL KEY: property
 * Property and valuables information
 * 
 * SECTION_ID: property
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function PropertyValuablesPage() {
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
        <SectionProperty data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="property" />
    </div>
  );
}
