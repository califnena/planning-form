import { SectionOverview } from "@/components/planner/sections/SectionOverview";
import { useNavigate } from "react-router-dom";
import NotAdviceNote from "@/components/NotAdviceNote";
import SEOHead from "@/components/SEOHead";

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
      <SEOHead title="Planner Overview | Everlasting Funeral Advisors" description="View your funeral planning progress and navigate to each section of your end-of-life plan." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/overview" />
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
