import { usePlanContext } from "./PlannerLayout";
import { SectionDigital } from "@/components/planner/sections/SectionDigital";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ClearSectionButton } from "@/components/planner/ClearSectionButton";
import SEOHead from "@/components/SEOHead";

/**
 * DigitalPage
 * 
 * CANONICAL KEY: digital / online_accounts
 * Online accounts and digital assets
 * 
 * SECTION_ID: digital
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function DigitalPage() {
  const { plan, updatePlan, saveState, activePlanId, refreshPlan } = usePlanContext();

  // Handle data changes - writes to plan_payload.online_accounts
  const handleChange = (updatedData: Record<string, any>) => {
    updatePlan(updatedData);
  };

  return (
    <div>
      <SEOHead title="Digital Accounts | Everlasting Funeral Advisors" description="Organize your online accounts and digital assets so loved ones can manage them when needed." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/digital" />
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
        <ClearSectionButton
          sectionId="digital"
          planId={activePlanId || plan?.id || ""}
          currentPayload={plan?.plan_payload || {}}
          onCleared={refreshPlan}
        />
      </div>
      <PreviewModeWrapper>
        <SectionDigital 
          data={plan} 
          onChange={handleChange} 
        />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="digital" />
    </div>
  );
}
