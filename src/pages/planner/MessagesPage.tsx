import { usePlanContext } from "./PlannerLayout";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * MessagesPage
 * 
 * CANONICAL KEY: messages
 * Messages to loved ones
 * 
 * SECTION_ID: messages
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function MessagesPage() {
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
        <SectionMessages data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="messages" />
    </div>
  );
}
