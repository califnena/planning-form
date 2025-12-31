import { usePlanContext } from "./PlannerLayout";
import { SectionPets } from "@/components/planner/sections/SectionPets";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useNavigate } from "react-router-dom";

export default function PetsPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/digital");
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
        <SectionPets data={plan} onChange={updatePlan} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="pets"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
