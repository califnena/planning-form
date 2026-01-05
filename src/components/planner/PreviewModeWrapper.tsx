import { ReactNode } from "react";
import { useLockState } from "@/contexts/PreviewModeContext";
import { InlineLockedNotice } from "./PreviewLockBanner";

interface PreviewModeWrapperProps {
  children: ReactNode;
  /** Show inline locked notice at the top */
  showNotice?: boolean;
}

/**
 * Wraps section content and automatically disables all inputs when locked.
 * 
 * BEHAVIOR:
 * - Unlocked: Children render normally with full interactivity
 * - Locked: 
 *   - Content is visible and readable
 *   - All inputs are disabled (pointer-events: none)
 *   - Visual indicator shows read-only state
 *   - Optional inline notice at top
 */
export function PreviewModeWrapper({ children, showNotice = false }: PreviewModeWrapperProps) {
  const { isLocked, isLoading } = useLockState();
  
  // While loading, don't apply lock state (prevents flash)
  if (isLoading) {
    return <>{children}</>;
  }
  
  // Unlocked: render children normally
  if (!isLocked) {
    return <>{children}</>;
  }

  // Locked: wrap in read-only container
  return (
    <div className="relative">
      {showNotice && <InlineLockedNotice />}
      
      {/* Content container with disabled inputs */}
      <div 
        className="preview-locked-content"
        style={{
          // Disable all pointer events on interactive elements
          // but keep content visible and readable
        }}
      >
        <style>{`
          .preview-locked-content input,
          .preview-locked-content textarea,
          .preview-locked-content select,
          .preview-locked-content button:not([data-unlock-button]),
          .preview-locked-content [role="button"],
          .preview-locked-content [role="checkbox"],
          .preview-locked-content [role="radio"],
          .preview-locked-content [role="switch"],
          .preview-locked-content [contenteditable="true"] {
            pointer-events: none !important;
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .preview-locked-content input:focus,
          .preview-locked-content textarea:focus,
          .preview-locked-content select:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
        {children}
      </div>
      
      {/* Invisible overlay to show not-allowed cursor on hover */}
      <div 
        className="absolute inset-0 cursor-not-allowed z-10 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Hook to conditionally disable form elements when locked.
 * Use this for more granular control than the wrapper.
 */
export function useLockedInputProps() {
  const { isLocked, isLoading } = useLockState();
  
  if (isLoading || !isLocked) {
    return {};
  }
  
  return {
    disabled: true,
    readOnly: true,
    'aria-disabled': true,
    style: { opacity: 0.7, cursor: 'not-allowed' }
  };
}
