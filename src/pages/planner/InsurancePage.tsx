import { usePlanContext } from "./PlannerLayout";
import { SectionInsurance } from "@/components/planner/sections/SectionInsurance";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import SEOHead from "@/components/SEOHead";

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
      <SEOHead title="Insurance Policies | Everlasting Funeral Advisors" description="Record your insurance policies and coverage details so your family knows where to find them." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/insurance" />
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
