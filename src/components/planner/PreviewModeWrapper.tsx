import { ReactNode } from "react";
import { useLockState, usePreviewModeContext } from "@/contexts/PreviewModeContext";
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
 *   - Clicking on inputs triggers unlock modal
 *   - Inputs appear slightly muted
 */
export function PreviewModeWrapper({ children, showNotice = false }: PreviewModeWrapperProps) {
  const { isLocked, isLoading } = useLockState();
  const { openLockedModal } = usePreviewModeContext();
  
  // While loading, don't apply lock state (prevents flash)
  if (isLoading) {
    return <>{children}</>;
  }
  
  // Unlocked: render children normally
  if (!isLocked) {
    return <>{children}</>;
  }

  const handleLockedClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if user clicked on an interactive element
    const isInteractive = target.closest('input, textarea, select, button:not([data-unlock-button]), [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable="true"]');
    if (isInteractive) {
      e.preventDefault();
      e.stopPropagation();
      openLockedModal("");
    }
  };

  // Locked: wrap in read-only container
  return (
    <div className="relative">
      {showNotice && <InlineLockedNotice />}
      
      {/* Content container with muted inputs */}
      <div 
        className="preview-locked-content"
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
            opacity: 0.7;
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
      
      {/* Clickable overlay to capture interactions */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleLockedClick}
        onMouseDown={(e) => {
          const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
          const isInteractive = target?.closest('input, textarea, select, button:not([data-unlock-button]), [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable="true"]');
          if (isInteractive) {
            e.preventDefault();
            e.stopPropagation();
            openLockedModal("");
          }
        }}
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
    style: { opacity: 0.7, cursor: 'pointer' }
  };
}
