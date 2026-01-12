import { usePlanContext } from "./PlannerLayout";
import { SectionContacts } from "@/components/planner/sections/SectionContacts";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";

/**
 * ContactsPage
 * 
 * CANONICAL KEY: people_to_notify
 * People to notify / important contacts
 * 
 * SECTION_ID: contacts
 * Navigation is handled by SectionNavigation using SECTION_REGISTRY
 */
export default function ContactsPage() {
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
        <SectionContacts data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation currentSection="contacts" />
    </div>
  );
}
