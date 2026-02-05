import { SectionOverview } from "@/components/planner/sections/SectionOverview";
import { useNavigate } from "react-router-dom";
import NotAdviceNote from "@/components/NotAdviceNote";
import { PreviewLockBanner } from "@/components/planner/PreviewLockBanner";
import { useLockState } from "@/contexts/PreviewModeContext";

// Section ID to route mapping
const sectionIdToRoute: Record<string, string> = {
  personal: "/preplandashboard/personal-family",
  legacy: "/preplandashboard/life-story",
  funeral: "/preplandashboard/funeral-wishes",
  financial: "/preplandashboard/financial-life",
  property: "/preplandashboard/property-valuables",
  legal: "/preplandashboard/legal-docs",
  insurance: "/preplandashboard/insurance",
  pets: "/preplandashboard/pets",
  digital: "/preplandashboard/digital",
  messages: "/preplandashboard/messages",
  contacts: "/preplandashboard/contacts",
  providers: "/preplandashboard/providers",
  checklist: "/preplandashboard/checklist",
  instructions: "/preplandashboard/instructions",
  legalresources: "/preplandashboard/legalresources",
  willprep: "/preplandashboard/willprep",
};

export default function OverviewPage() {
  const navigate = useNavigate();
  const { isLocked, isLoading } = useLockState();

  return (
    <>
      <NotAdviceNote />
      {/* Show prominent preview mode welcome banner when in preview mode */}
      {!isLoading && isLocked && (
        <PreviewLockBanner prominent />
      )}
      <SectionOverview
        onNavigateToChecklist={() => navigate("/preplandashboard/checklist")}
        onNavigateToSection={(sectionId) => {
          const route = sectionIdToRoute[sectionId];
          if (route) navigate(route);
        }}
      />
    </>
  );
}
