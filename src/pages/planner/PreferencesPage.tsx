import { usePlanContext } from "./PlannerLayout";
import { SectionPreferences } from "@/components/planner/sections/SectionPreferences";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

export default function PreferencesPage() {
  const { user, userSettings } = usePlanContext();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <>
      <SEOHead title="Planner Preferences | Everlasting Funeral Advisors" description="Customize your funeral planner settings and preferences for a personalized experience." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/preferences" />
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
    </>
  );
}
