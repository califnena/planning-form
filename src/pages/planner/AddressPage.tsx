import { usePlanContext } from "./PlannerLayout";
import { SectionAddress } from "@/components/planner/sections/SectionAddress";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";

export default function AddressPage() {
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
        <SectionAddress data={plan} onChange={(data) => updatePlan(data)} />
      </PreviewModeWrapper>
      <SectionNavigation
        currentSection="address"
        onNext={() => navigate("/preplandashboard/personal-family")}
        onSave={() => {}}
      />
    </div>
  );
}
