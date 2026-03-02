import { usePlanContext } from "./PlannerLayout";
import { SectionLegacy } from "@/components/planner/sections/SectionLegacy";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import SEOHead from "@/components/SEOHead";

/**
 * LifeStoryPage
 * 
 * CANONICAL KEY: legacy
 * Life story and legacy information
 * 
 * SECTION_ID: legacy
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function LifeStoryPage() {
  const { plan, updatePlan, saveState } = usePlanContext();

  return (
    <div>
      <SEOHead title="Life Story & Legacy | Everlasting Funeral Advisors" description="Capture your life story, memories, and legacy for your family to cherish." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/life-story" />
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <PreviewModeWrapper>
        <SectionLegacy
          data={plan}
          onChange={(data) => updatePlan(data)}
        />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="legacy" />
    </div>
  );
}
