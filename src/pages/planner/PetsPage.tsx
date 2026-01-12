import { usePlanContext } from "./PlannerLayout";
import { SectionPets } from "@/components/planner/sections/SectionPets";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * PetsPage
 * 
 * CANONICAL KEY: pets
 * Pet care information
 * 
 * SECTION_ID: pets
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function PetsPage() {
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
        <SectionPets data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="pets" />
    </div>
  );
}
