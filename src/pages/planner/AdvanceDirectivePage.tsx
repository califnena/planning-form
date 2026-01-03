import { usePlanContext } from "./PlannerLayout";
import { SectionAdvanceDirective } from "@/components/planner/sections/SectionAdvanceDirective";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdvanceDirectivePage() {
  const { user, plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const advanceDirectiveData = plan.advance_directive || {};

  // One-time migration from legacy localStorage
  useEffect(() => {
    if (!user?.id) return;
    if (advanceDirectiveData && Object.keys(advanceDirectiveData).length > 0) return;

    const stored = localStorage.getItem(`advance_directive_${user.id}`);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        updatePlan({ advance_directive: parsed });
      }
    } catch (e) {
      console.error("Error parsing advance directive data:", e);
    }
  }, [user?.id, updatePlan]);

  const handleChange = (data: any) => {
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
