import { usePlanContext } from "./PlannerLayout";
import { SectionWillPrep } from "@/components/planner/sections/SectionWillPrep";

export default function WillPrepPage() {
  const { plan } = usePlanContext();
  return <SectionWillPrep data={plan} />;
}
