import { usePlanContext } from "./PlannerLayout";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

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
        <SectionMessages data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="messages"
        onNext={() => navigate("/preplan-summary")}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={true}
        onSave={() => {}}
      />
    </div>
  );
}
