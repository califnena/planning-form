import { usePlanContext } from "./PlannerLayout";
import { SectionPersonalInfo } from "@/components/planner/sections/SectionPersonalInfo";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * PersonalInfoPage
 * 
 * CANONICAL KEY: personal_information
 * Core personal data: name, DOB, address, contact, military
 * 
 * SECTION_ID: personal_info
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function PersonalInfoPage() {
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
        <SectionPersonalInfo data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="personal_info" />
    </div>
  );
}
