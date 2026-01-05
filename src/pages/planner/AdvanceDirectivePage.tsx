import { usePlanContext } from "./PlannerLayout";
import { SectionAdvanceDirective, AdvanceDirectiveData } from "@/components/planner/sections/SectionAdvanceDirective";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

/**
 * CANONICAL STORAGE: plan_payload.advance_directive
 * 
 * Rules:
 * - NO localStorage
 * - NO duplicate keys
 * - All reads/writes go through plan.advance_directive
 */
export default function AdvanceDirectivePage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  // Read ONLY from plan.advance_directive (canonical path)
  const advanceDirectiveData: Partial<AdvanceDirectiveData> = plan.advance_directive || {};

  const handleChange = (data: AdvanceDirectiveData) => {
    // Write ONLY to advance_directive in plan_payload
    updatePlan({ advance_directive: data });
  };

  const handleNext = () => {
    navigate("/preplandashboard/travel-planning");
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
        <SectionAdvanceDirective data={advanceDirectiveData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="advance-directive"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
