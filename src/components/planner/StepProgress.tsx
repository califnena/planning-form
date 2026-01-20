import { useLocation } from "react-router-dom";
import { getSectionNavigationByRoute } from "@/lib/sectionRegistry";
import { isEmotionalStageRoute } from "@/lib/utils";

/**
 * StepProgress
 * 
 * Displays a simple "Step X of Y" progress indicator for senior users.
 * Uses the section registry as the single source of truth.
 * Note: Shows step count only, no percentages or progress bars.
 */
export const StepProgress = () => {
  const location = useLocation();
  const { currentStep, totalSteps, isRegistrySection } = getSectionNavigationByRoute(location.pathname);

  // Don't show progress on non-registry pages, overview, or emotional stage routes
  if (!isRegistrySection || currentStep === 0 || isEmotionalStageRoute(location.pathname)) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground font-medium">
      Step {currentStep} of {totalSteps}
    </span>
  );
};
