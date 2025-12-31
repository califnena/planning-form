import { usePlanContext } from "./PlannerLayout";
import { SectionFinancial } from "@/components/planner/sections/SectionFinancial";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useNavigate } from "react-router-dom";

export default function FinancialLifePage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/insurance");
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
        <SectionFinancial data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="financial"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
