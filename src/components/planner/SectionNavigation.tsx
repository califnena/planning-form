import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { SaveAndBreakButton } from "./SaveAndBreakButton";
import { useNavigate, useLocation } from "react-router-dom";
import { getSectionNavigationByRoute } from "@/lib/sectionRegistry";

interface SectionNavigationProps {
  /** Current section ID - used for legacy compatibility but not for navigation */
  currentSection?: string;
  /** Optional override for save handler */
  onSave?: () => Promise<void> | void;
}

/**
 * SectionNavigation
 * 
 * Provides Back/Next navigation using SECTION_REGISTRY as single source of truth.
 * - Back: goes to previous section, or Overview if first
 * - Next: goes to next section, or Plan Summary if last
 * - Non-registry pages: both buttons go to Overview (safe fallback)
 */
export const SectionNavigation = ({
  currentSection,
  onSave,
}: SectionNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get navigation from registry based on current route
  const { prevRoute, nextRoute, isFirst, isLast, isRegistrySection } = getSectionNavigationByRoute(location.pathname);

  const handleBack = () => {
    navigate(prevRoute);
  };

  const handleNext = () => {
    navigate(nextRoute);
  };

  // Non-registry pages: show simplified navigation back to Overview
  if (!isRegistrySection) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t mt-8">
        <Button 
          onClick={() => navigate("/preplandashboard/overview")} 
          variant="outline" 
          size="lg" 
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Planning Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t mt-8">
      <div className="flex gap-3">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          size="lg" 
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <SaveAndBreakButton onSave={onSave} />
      </div>
      
      <div className="flex gap-3">
        {isLast ? (
          <Button onClick={handleNext} size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            View My Plan Summary
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" className="gap-2">
            Next Section
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
