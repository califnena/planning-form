import { SectionLegalResources } from "@/components/planner/sections/SectionLegalResources";
import SEOHead from "@/components/SEOHead";

export default function LegalResourcesPage() {
  return (
    <>
      <SEOHead title="Legal Resources | Everlasting Funeral Advisors" description="Access helpful legal resources and references for your end-of-life planning needs." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/legalresources" />
      <SectionLegalResources />
    </>
  );
}
