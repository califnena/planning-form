import { usePlanContext } from "./PlannerLayout";
import { SectionCarePreferences } from "@/components/planner/sections/SectionCarePreferences";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CarePreferencesPage() {
  const { user, saveState } = usePlanContext();
  const navigate = useNavigate();

  // Store care preferences in localStorage (not DB to avoid migration)
  const [carePreferencesData, setCarePreferencesData] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`care_preferences_${user.id}`);
      if (stored) {
        try {
          setCarePreferencesData(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing care preferences data:", e);
        }
      }
    }
  }, [user?.id]);

  const handleChange = (data: any) => {
    setCarePreferencesData(data);
    if (user?.id) {
      localStorage.setItem(`care_preferences_${user.id}`, JSON.stringify(data));
    }
  };

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
        <SectionCarePreferences data={carePreferencesData} onChange={handleChange} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="care-preferences"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
