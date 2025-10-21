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
      {items.map((item) => renderNavButton(item))}
    </nav>
  );
};
