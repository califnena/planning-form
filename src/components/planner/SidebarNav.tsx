import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import { getSectionIcon } from "@/lib/sectionIcons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  // Define which sections have tooltips
  const tooltips: Record<string, string> = {
    overview: "A simple checklist of the most important items",
    instructions: "Notes for your loved ones about what you want",
    personal: "Basic information about you and your family",
    legacy: "Your life story, memories, and achievements",
    contacts: "People who should be contacted",
    providers: "Funeral homes and service providers",
    funeral: "The kind of service you want",
    financial: "Bank accounts, bills, and debts",
    insurance: "Life insurance and benefits",
    property: "Homes, vehicles, and valuables",
    pets: "Who will care for your pets",
    digital: "Online accounts and passwords",
    legal: "Where your legal documents are stored",
    messages: "Letters for loved ones",
    preferences: "Choose which topics apply to you",
    legalresources: "Essential legal forms and state-specific guides",
    resources: "Helpful guides and references",
    faq: "Plain answers to common questions",
  };

  // Check if user has enabled any sections (beyond preferences and always-visible)
  const hasEnabledSections = items.some(item => 
    item.id !== "preferences" && item.id !== "legalresources" && item.id !== "resources" && item.id !== "faq"
  );

  // Separate always-visible sections from user-selected sections
  const alwaysVisibleIds = new Set(["preferences", "legalresources", "resources", "faq"]);
  const userSections = items.filter(item => !alwaysVisibleIds.has(item.id));
  const alwaysVisibleSections = items.filter(item => alwaysVisibleIds.has(item.id));

  const renderNavButton = (item: NavItem) => {
    const Icon = getSectionIcon(item.id);
    
    const button = (
      <button
        onClick={() => onSectionChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg transition-all duration-200 text-left group",
          "hover:bg-accent/50",
          activeSection === item.id
            ? "bg-primary/10 text-primary font-semibold"
            : "text-foreground hover:text-foreground"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          activeSection === item.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )} />
        <span className="flex-1">{item.label}</span>
        <ProgressDot completed={item.completed} />
      </button>
    );

    // If this item has a tooltip, wrap it
    if (tooltips[item.id]) {
      return (
        <TooltipProvider key={item.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="bg-popover text-popover-foreground border max-w-xs p-3 text-sm"
              sideOffset={8}
            >
              <p>{tooltips[item.id]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.id}>{button}</div>;
  };

  return (
    <nav className="space-y-6">
      {/* User-selected sections */}
      {userSections.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground px-4 mb-3">
            {t("sidebar.yourPlanner")}
          </h3>
          {userSections.map(renderNavButton)}
        </div>
      )}

      {/* Show a message if no sections are enabled yet */}
      {!hasEnabledSections && (
        <div className="px-4 py-6 text-center bg-muted/30 rounded-lg mx-2">
          <p className="text-sm text-muted-foreground">
            {t("sidebar.getStartedMessage")}
          </p>
        </div>
      )}

      {/* Help & Support */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground px-4 mb-3">
          {t("sidebar.helpSupport")}
        </h3>
        {alwaysVisibleSections.map(renderNavButton)}
      </div>
    </nav>
  );
};
