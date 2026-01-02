import { usePlanContext } from "./PlannerLayout";
import { SectionAdvanceDirective } from "@/components/planner/sections/SectionAdvanceDirective";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AdvanceDirectivePage() {
  const { user, saveState } = usePlanContext();
  const navigate = useNavigate();

  const [advanceDirectiveData, setAdvanceDirectiveData] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`advance_directive_${user.id}`);
      if (stored) {
        try {
          setAdvanceDirectiveData(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing advance directive data:", e);
        }
      }
    }
  }, [user?.id]);

  const handleChange = (data: any) => {
    setAdvanceDirectiveData(data);
    if (user?.id) {
      localStorage.setItem(`advance_directive_${user.id}`, JSON.stringify(data));
    }
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
