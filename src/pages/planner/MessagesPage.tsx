import { usePlanContext } from "./PlannerLayout";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import SEOHead from "@/components/SEOHead";

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
      <SEOHead title="Messages to Loved Ones | Everlasting Funeral Advisors" description="Write personal messages to your loved ones to be shared when the time comes." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/messages" />
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
