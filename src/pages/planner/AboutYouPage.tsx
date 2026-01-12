import { usePlanContext } from "./PlannerLayout";
import { SectionAboutYouNew } from "@/components/planner/sections/SectionAboutYouNew";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * AboutYouPage
 * 
 * CANONICAL KEY: about_you
 * Family info: parents, children, faith, background
 * 
 * SECTION_ID: about_you
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function AboutYouPage() {
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
        <SectionAboutYouNew data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="about_you" />
    </div>
  );
}
