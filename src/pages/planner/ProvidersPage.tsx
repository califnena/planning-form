import { usePlanContext } from "./PlannerLayout";
import { SectionVendors } from "@/components/planner/sections/SectionVendors";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * ProvidersPage
 * 
 * Service providers and vendors section
 * 
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function ProvidersPage() {
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
        <SectionVendors data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="providers" />
    </div>
  );
}
