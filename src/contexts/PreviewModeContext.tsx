import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuthState } from "@/hooks/useAuthState";

interface PreviewModeContextType {
  isPreviewMode: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  // Purchase states from auth
  hasPaidAccess: boolean;
  hasVIPAccess: boolean;
  hasPrintableAccess: boolean;
  hasDoneForYouAccess: boolean;
  // Modal control
  showLockedModal: boolean;
  lockedModalMessage: string;
  lockedModalAction: string;
  openLockedModal: (message: string, action?: string) => void;
  closeLockedModal: () => void;
  // Redirect safety
  saveLastVisitedRoute: (route: string) => void;
  getLastVisitedRoute: () => string | null;
  clearLastVisitedRoute: () => void;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

interface PreviewModeProviderProps {
  children: ReactNode;
}

/**
 * Global context for preview mode state and locked feature handling.
 * Wraps the entire app to provide consistent auth-based UI behavior.
 */
export function PreviewModeProvider({ children }: PreviewModeProviderProps) {
  const {
    isLoggedIn,
    isLoading,
    hasPaidAccess,
    hasVIPAccess,
    hasPrintableAccess,
    hasDoneForYouAccess,
    saveLastVisitedRoute,
    getLastVisitedRoute,
    clearLastVisitedRoute
  } = useAuthState();

  // Modal state for locked features
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedModalMessage, setLockedModalMessage] = useState("");
  const [lockedModalAction, setLockedModalAction] = useState("sign-in");

  const openLockedModal = useCallback((message: string, action: string = "sign-in") => {
    setLockedModalMessage(message);
    setLockedModalAction(action);
    setShowLockedModal(true);
  }, []);

  const closeLockedModal = useCallback(() => {
    setShowLockedModal(false);
    setLockedModalMessage("");
    setLockedModalAction("sign-in");
  }, []);

  // Preview mode = not logged in
  const isPreviewMode = !isLoggedIn;

  return (
    <PreviewModeContext.Provider
      value={{
        isPreviewMode,
        isLoggedIn,
        isLoading,
        hasPaidAccess,
        hasVIPAccess,
        hasPrintableAccess,
        hasDoneForYouAccess,
        showLockedModal,
        lockedModalMessage,
        lockedModalAction,
        openLockedModal,
        closeLockedModal,
        saveLastVisitedRoute,
        getLastVisitedRoute,
        clearLastVisitedRoute
      }}
    >
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewModeContext() {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error("usePreviewModeContext must be used within a PreviewModeProvider");
  }
  return context;
}
