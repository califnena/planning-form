import { usePlanContext } from "./PlannerLayout";
import { SectionSignature } from "@/components/planner/sections/SectionSignature";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * SignaturePage
 * 
 * CANONICAL KEY: signature / revisions
 * Plan review and optional signature
 * 
 * SECTION_ID: signature
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function SignaturePage() {
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
        <SectionSignature data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="signature" />
    </div>
  );
}
