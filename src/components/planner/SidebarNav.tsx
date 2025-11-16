import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  id: string;
  label: string;
  completed: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const SidebarNav = ({ items, activeSection, onSectionChange }: SidebarNavProps) => {
  // Define which sections have tooltips
  const tooltips: Record<string, string> = {
    about: "About me",
    guide: "guides"
  };

  // Check if user has enabled any sections (beyond preferences and always-visible)
  const hasEnabledSections = items.some(item => 
    item.id !== "preferences" && item.id !== "resources" && item.id !== "faq"
  );

  const renderNavButton = (item: NavItem) => {
    const button = (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
          activeSection === item.id
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <ProgressDot completed={item.completed} />
        <span>{item.label}</span>
      </button>
    );

    // If this item has a tooltip, wrap it
    if (tooltips[item.id]) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border">
              <p>{tooltips[item.id]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        // Show preferences always
        if (item.id === "preferences") {
          return renderNavButton(item);
        }
        
        // Show always-visible sections
        if (item.id === "resources" || item.id === "faq") {
          return renderNavButton(item);
        }
        
        // Show other enabled sections
        return renderNavButton(item);
      })}
      
      {/* Show message when no sections are enabled */}
      {!hasEnabledSections && (
        <div className="px-3 py-4 text-sm text-muted-foreground italic bg-muted/30 rounded-md mt-4">
          Choose the topics you want to work on in Preferences.
        </div>
      )}
    </nav>
  );
};
