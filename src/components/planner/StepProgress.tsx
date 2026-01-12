import { useLocation } from "react-router-dom";
import { getSectionNavigationByRoute } from "@/lib/sectionRegistry";

/**
 * StepProgress
 * 
 * Displays a simple "Step X of Y" progress indicator for senior users.
 * Uses the section registry as the single source of truth.
 */
export const StepProgress = () => {
  const location = useLocation();
  const { currentStep, totalSteps, isRegistrySection } = getSectionNavigationByRoute(location.pathname);

  // Don't show progress on non-registry pages (like overview)
  if (!isRegistrySection || currentStep === 0) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground font-medium">
      Step {currentStep} of {totalSteps}
    </span>
  );
};
