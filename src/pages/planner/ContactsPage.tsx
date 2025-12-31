import { usePlanContext } from "./PlannerLayout";
import { SectionContacts } from "@/components/planner/sections/SectionContacts";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useNavigate } from "react-router-dom";

export default function ContactsPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/life-story");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <ViewDocumentButton />
      <PreviewModeWrapper>
        <SectionContacts data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="contacts"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
