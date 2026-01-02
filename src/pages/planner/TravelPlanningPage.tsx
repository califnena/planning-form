import { usePlanContext } from "./PlannerLayout";
import { SectionTravelPlanning } from "@/components/planner/sections/SectionTravelPlanning";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function TravelPlanningPage() {
  const { user, saveState } = usePlanContext();
  const navigate = useNavigate();

  const [travelData, setTravelData] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`travel_planning_${user.id}`);
      if (stored) {
        try {
          setTravelData(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing travel data:", e);
        }
      }
    }
  }, [user?.id]);

  const handleChange = (data: any) => {
    setTravelData(data);
    if (user?.id) {
      localStorage.setItem(`travel_planning_${user.id}`, JSON.stringify(data));
    }
  };

  const handleNext = () => {
    navigate("/preplandashboard/funeral-wishes");
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
        <SectionTravelPlanning data={travelData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="travel-planning"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
