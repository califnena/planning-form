import { usePlanContext } from "./PlannerLayout";
import { SectionSignature } from "@/components/planner/sections/SectionSignature";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

export default function SignaturePage() {
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
      <PreviewModeWrapper>
        <SectionSignature data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="signature"
        onNext={() => navigate("/preplan-summary")}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={true}
        onSave={() => {}}
      />
    </div>
  );
}
