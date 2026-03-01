import SEOHead from "@/components/SEOHead";
import { SectionLegalResources } from "@/components/planner/sections/SectionLegalResources";
import { GlobalHeader } from "@/components/GlobalHeader";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const LegalDocuments = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Legal Document Resources | Everlasting Funeral Advisors" description="Find legal resources and document templates for wills, trusts, advance directives, and estate planning." canonicalUrl="https://planner.everlastingfuneraladvisors.com/legal-documents" />
      <GlobalHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackToHomeButton />
        </div>
        <SectionLegalResources />
      </div>
    </div>
  );
};

export default LegalDocuments;
