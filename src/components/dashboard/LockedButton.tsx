import { Button, ButtonProps } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LockedButtonProps extends Omit<ButtonProps, 'onClick'> {
  children: React.ReactNode;
  isLocked?: boolean;
  onUnlockedClick?: () => void;
  loginRedirect?: string;
}

export const LockedButton = ({ 
  children, 
  isLocked = false, 
  onUnlockedClick,
  loginRedirect = "/login",
  className,
  variant = "outline",
  ...props 
}: LockedButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLocked) {
      navigate(loginRedirect);
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
          "opacity-60 cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        {...props}
      >
        <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
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
