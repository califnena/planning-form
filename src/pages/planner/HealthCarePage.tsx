import { usePlanContext } from "./PlannerLayout";
import { SectionHealthCare } from "@/components/planner/sections/SectionHealthCare";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HealthCarePage() {
  const { user, saveState } = usePlanContext();
  const navigate = useNavigate();

  const [healthCareData, setHealthCareData] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`health_care_${user.id}`);
      if (stored) {
        try {
          setHealthCareData(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing health care data:", e);
        }
      }
    }
  }, [user?.id]);

  const handleChange = (data: any) => {
    setHealthCareData(data);
    if (user?.id) {
      localStorage.setItem(`health_care_${user.id}`, JSON.stringify(data));
    }
  };

  const handleNext = () => {
    navigate("/preplandashboard/care-preferences");
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
        <SectionHealthCare data={healthCareData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="health-care"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
