import { usePlanContext } from "./PlannerLayout";
import { SectionWillPrep } from "@/components/planner/sections/SectionWillPrep";
import SEOHead from "@/components/SEOHead";

export default function WillPrepPage() {
  const { plan } = usePlanContext();
  return (
    <>
      <SEOHead title="Will Preparation | Everlasting Funeral Advisors" description="Prepare your will and estate documents with guided steps and helpful resources." canonicalUrl="https://planner.everlastingfuneraladvisors.com/preplandashboard/willprep" />
      <SectionWillPrep data={plan} />
    </>
  );
}
