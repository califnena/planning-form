/**
 * Hook to protect against accidental navigation when there are unsaved changes.
 * Shows a browser confirmation on tab close and can trigger a custom dialog on navigation.
 */

import { useEffect, useCallback, useState } from "react";
import { useBlocker } from "react-router-dom";

interface UseUnsavedChangesGuardOptions {
  /** Whether there are unsaved changes to protect */
  hasUnsavedChanges: boolean;
  /** Custom message for the confirmation dialog */
  message?: string;
}

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UseUnsavedChangesGuardOptions) {
  const [showDialog, setShowDialog] = useState(false);

  // Block browser navigation (back button, link clicks) with react-router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but this is still required
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Show dialog when blocker is triggered
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowDialog(true);
    }
  }, [blocker.state]);

  const confirmNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    setShowDialog(false);
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setShowDialog(false);
  }, [blocker]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    message,
  };
}
