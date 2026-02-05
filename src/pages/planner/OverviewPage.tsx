import { SectionOverview } from "@/components/planner/sections/SectionOverview";
import { useNavigate } from "react-router-dom";
import NotAdviceNote from "@/components/NotAdviceNote";

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

  return (
    <>
      <NotAdviceNote />
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
