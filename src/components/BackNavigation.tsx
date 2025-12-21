import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackNavigationProps {
  className?: string;
  showBackToMenu?: boolean;
}

/**
 * Emotional back navigation - not relying on browser back.
 * Shows "Back to Home" and optionally "Back to Planning Menu"
 */
export const BackNavigation = ({ className, showBackToMenu = true }: BackNavigationProps) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-muted-foreground hover:text-foreground">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      {showBackToMenu && (
        <>
          <span className="text-muted-foreground/50">|</span>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Planning Menu
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};
