import { SectionLegalResources } from "@/components/planner/sections/SectionLegalResources";
import { GlobalHeader } from "@/components/GlobalHeader";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const LegalDocuments = () => {
  return (
    <div className="min-h-screen bg-background">
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
