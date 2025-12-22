import { usePlanContext } from "./PlannerLayout";
import { SectionPreferences } from "@/components/planner/sections/SectionPreferences";
import { useNavigate } from "react-router-dom";

export default function PreferencesPage() {
  const { user, userSettings } = usePlanContext();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <SectionPreferences 
      user={user} 
      onSave={() => {
        // Reload settings after save
        window.location.reload();
      }}
      onContinue={() => {
        navigate("/preplandashboard/overview");
      }}
      showWelcome={!userSettings || userSettings.length === 0}
    />
  );
}
