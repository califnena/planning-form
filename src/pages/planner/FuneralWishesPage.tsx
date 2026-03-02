import { usePlanContext } from "./PlannerLayout";
import { SectionFuneral } from "@/components/planner/sections/SectionFuneral";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import SEOHead from "@/components/SEOHead";

/**
 * FuneralWishesPage
 * 
 * CANONICAL KEY: funeral
 * Funeral wishes and preferences
 * 
 * SECTION_ID: funeral
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function FuneralWishesPage() {
  const { plan, updatePlan, saveState } = usePlanContext();

  return (
    <div>
      <SEOHead title="Funeral Wishes | Everlasting Funeral Advisors" description="Record your funeral service preferences including burial, cremation, and memorial wishes." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/funeral-wishes" />
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <PreviewModeWrapper>
        <SectionFuneral data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="funeral" />
    </div>
  );
}
