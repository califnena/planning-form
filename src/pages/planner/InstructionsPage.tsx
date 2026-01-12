import { usePlanContext } from "./PlannerLayout";
import { SectionInstructions } from "@/components/planner/sections/SectionInstructions";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * InstructionsPage
 * 
 * Instructions section
 * 
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function InstructionsPage() {
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
        <SectionInstructions
          value={plan.instructions_notes}
          onChange={(value) => updatePlan({ instructions_notes: value })}
        />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="instructions" />
    </div>
  );
}
