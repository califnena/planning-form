import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuthState } from "@/hooks/useAuthState";

interface PreviewModeContextType {
  /**
   * SINGLE SOURCE OF TRUTH for lock state.
   * isUnlocked = true means user can edit, save, and download final PDF.
   * isUnlocked = false means read-only mode (preview).
   */
  isUnlocked: boolean;
  
  /** Legacy alias for !isUnlocked */
  isPreviewMode: boolean;
  
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Purchase states from auth
  hasPaidAccess: boolean;
  hasVIPAccess: boolean;
  hasPrintableAccess: boolean;
  hasDoneForYouAccess: boolean;
  
  // Modal control (deprecated - using inline banners instead)
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
 * Global context for preview/lock mode state.
 * 
 * SINGLE SOURCE LOCK FLAG: isUnlocked
 * - Derived from hasPaidAccess (subscription or premium purchase)
 * - Used by all sections, PDF generator, and summary
 * - Flips immediately when user unlocks (no refresh needed)
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

  // Modal state for locked features (legacy - prefer inline banners)
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

  /**
   * SINGLE SOURCE OF TRUTH: isUnlocked
   * 
   * User is unlocked when:
   * - They have paid access (premium, VIP, or done-for-you)
   * 
   * This flag controls:
   * - Input enabled/disabled state
   * - Add/Edit/Delete button visibility
   * - PDF download (final) availability
   * - Save functionality
   */
  const isUnlocked = hasPaidAccess || hasVIPAccess || hasDoneForYouAccess;
  
  // Legacy alias for backwards compatibility
  const isPreviewMode = !isUnlocked;

  return (
    <PreviewModeContext.Provider
      value={{
        isUnlocked,
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

/**
 * Hook to get just the lock state (for simpler usage in components)
 */
export function useLockState() {
  const { isUnlocked, isPreviewMode, isLoading } = usePreviewModeContext();
  return { isUnlocked, isLocked: !isUnlocked, isPreviewMode, isLoading };
}
