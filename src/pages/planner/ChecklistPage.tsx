import { usePlanContext } from "./PlannerLayout";
import { SectionChecklist } from "@/components/planner/sections/SectionChecklist";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * ChecklistPage
 * 
 * Pre-planning checklist section
 * 
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function ChecklistPage() {
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
        <SectionChecklist data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="checklist" />
    </div>
  );
}
