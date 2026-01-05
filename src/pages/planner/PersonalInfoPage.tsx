import { usePlanContext } from "./PlannerLayout";
import { SectionPersonalInfo } from "@/components/planner/sections/SectionPersonalInfo";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

/**
 * PersonalInfoPage
 * 
 * CANONICAL KEY: personal_information
 * Core personal data: name, DOB, address, contact, military
 */
export default function PersonalInfoPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/about-you");
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
        <SectionPersonalInfo data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="personal_info"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
