import { usePlanContext } from "./PlannerLayout";
import { SectionLegal } from "@/components/planner/sections/SectionLegal";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

export default function LegalDocsPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/messages");
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
      <PreviewModeWrapper>
        <SectionLegal data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="legal"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
