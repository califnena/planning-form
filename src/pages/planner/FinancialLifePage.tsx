import { usePlanContext } from "./PlannerLayout";
import { SectionFinancial } from "@/components/planner/sections/SectionFinancial";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import SEOHead from "@/components/SEOHead";

/**
 * FinancialLifePage
 * 
 * CANONICAL KEY: financial
 * Financial accounts and information
 * 
 * SECTION_ID: financial
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function FinancialLifePage() {
  const { plan, updatePlan, saveState } = usePlanContext();

  return (
    <div>
      <SEOHead title="Financial Life | Everlasting Funeral Advisors" description="Document your financial accounts, assets, and information for your family's reference." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/financial-life" />
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <PreviewModeWrapper>
        <SectionFinancial data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="financial" />
    </div>
  );
}
