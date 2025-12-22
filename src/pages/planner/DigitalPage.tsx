import { usePlanContext } from "./PlannerLayout";
import { SectionDigital } from "@/components/planner/sections/SectionDigital";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

export default function DigitalPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/legal-docs");
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
        <SectionDigital data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="digital"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
