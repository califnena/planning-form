/**
 * Hook to prompt users to review their plan before leaving Planning Mode.
 * Shows an exit confirmation dialog when navigating away from planner routes.
 */

import { useEffect, useCallback, useState } from "react";
import { useBlocker, useLocation } from "react-router-dom";

interface UseExitPlannerGuardOptions {
  /** Whether the user has any plan data that could be reviewed */
  hasPlanData: boolean;
  /** Whether the user has already reviewed their plan */
  hasReviewed?: boolean;
}

export function useExitPlannerGuard({
  hasPlanData,
  hasReviewed = false,
}: UseExitPlannerGuardOptions) {
  const [showDialog, setShowDialog] = useState(false);
  const location = useLocation();
  
  // Only trigger when navigating FROM planner TO non-planner routes
  const isPlannerRoute = (pathname: string) => 
    pathname.startsWith("/preplandashboard") || pathname.startsWith("/planner");
  
  const isReviewRoute = (pathname: string) =>
    pathname === "/preplan-summary";

  // Block navigation when leaving planner without reviewing
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      const leavingPlanner = isPlannerRoute(currentLocation.pathname) && 
                             !isPlannerRoute(nextLocation.pathname) &&
                             !isReviewRoute(nextLocation.pathname);
      
      // Only show if user has data, hasn't reviewed, and is actually leaving planner
      return hasPlanData && !hasReviewed && leavingPlanner;
    }
  );

  // Show dialog when blocker is triggered
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowDialog(true);
    }
  }, [blocker.state]);

  const handleReview = useCallback(() => {
    // Reset blocker first, then navigate to review page
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setShowDialog(false);
    // Return true to signal caller should navigate to review
    return true;
  }, [blocker]);

  const confirmExit = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    setShowDialog(false);
  }, [blocker]);

  const cancelExit = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setShowDialog(false);
  }, [blocker]);

  return {
    showDialog,
    handleReview,
    confirmExit,
    cancelExit,
  };
}
