import { Button, ButtonProps } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";

interface LockedButtonProps extends Omit<ButtonProps, 'onClick'> {
  children: React.ReactNode;
  isLocked?: boolean;
  onUnlockedClick?: () => void;
  lockedMessage?: string;
}

/**
 * Button that shows lock icon and triggers login modal when in preview mode.
 * When unlocked (logged in), executes the normal action.
 */
export const LockedButton = ({ 
  children, 
  isLocked = false, 
  onUnlockedClick,
  lockedMessage = "Sign in to save your progress and personalize your plan.",
  className,
  variant = "outline",
  ...props 
}: LockedButtonProps) => {
  const location = useLocation();
  const { openLockedModal, saveLastVisitedRoute } = usePreviewModeContext();

  const handleClick = () => {
    if (isLocked) {
      saveLastVisitedRoute(location.pathname + location.search);
      openLockedModal(lockedMessage);
    } else if (onUnlockedClick) {
      onUnlockedClick();
    }
  };

  if (isLocked) {
    return (
      <Button
        variant={variant}
        onClick={handleClick}
        className={cn(
          "opacity-60 cursor-pointer hover:opacity-80 transition-opacity gap-2",
          className
        )}
        {...props}
      >
        <Lock className="h-4 w-4 flex-shrink-0" />
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={onUnlockedClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};
