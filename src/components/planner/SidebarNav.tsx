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
import { useNavigate } from "react-router-dom";
import { Package, Heart, UserCheck, FileText } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  completed: boolean;
}

interface SectionGroup {
  label: string;
  sections: string[];
}

interface SidebarNavProps {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  hideResources?: boolean;
  browseMode?: boolean;
  sectionGroups?: SectionGroup[];
}

// Support & Services items that route to external pages
const supportServicesItems = [
  { id: "order-binder", label: "Order Binder", route: "/pricing", icon: Package },
  { id: "compassionate-guidance", label: "Compassionate Guidance", route: "/care-support", icon: Heart },
  { id: "done-for-you", label: "Done-For-You Service", route: "/done-for-you", icon: UserCheck },
];

export const SidebarNav = ({ 
  items, 
  activeSection, 
  onSectionChange,
  hideResources = false,
  browseMode = false,
  sectionGroups = []
}: SidebarNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    willprep: "Organize your wishes and create a draft to review with an attorney",
  };

  // Check if user has enabled any sections (beyond preferences)
  const hasEnabledSections = items.some(item => 
    item.id !== "preferences"
  );

  // All items are now user sections
  const userSections = items;

  // Collapsed/Guided mode - icon only
  const renderCollapsedButton = (item: NavItem) => {
    const Icon = getSectionIcon(item.id);
    
    return (
      <TooltipProvider key={item.id} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                "hover:bg-accent/50",
                activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="bg-popover text-popover-foreground border px-3 py-2"
            sideOffset={8}
          >
            <p className="font-medium">{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Full/Browse mode button
  const renderNavButton = (item: NavItem, showDot: boolean = true) => {
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
          "h-5 w-5 flex-shrink-0",
          activeSection === item.id ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="flex-1">{item.label}</span>
        {showDot && <ProgressDot completed={item.completed} />}
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

  // Group sections for browse mode
  const getGroupedSections = () => {
    if (!browseMode || sectionGroups.length === 0) return null;
    
    return sectionGroups.map((group) => {
      const groupItems = userSections.filter(item => group.sections.includes(item.id));
      if (groupItems.length === 0) return null;
      
      return (
        <div key={group.label} className="mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
            {group.label}
          </h4>
          <div className="space-y-1">
            {groupItems.map(item => renderNavButton(item, false))}
          </div>
        </div>
      );
    });
  };

  // Get ungrouped sections (ones not in any group)
  const getUngroupedSections = () => {
    if (!browseMode || sectionGroups.length === 0) return userSections;
    
    const groupedIds = sectionGroups.flatMap(g => g.sections);
    return userSections.filter(item => !groupedIds.includes(item.id));
  };

  // GUIDED MODE (collapsed)
  if (!browseMode) {
    return (
      <nav className="space-y-2">
        {userSections.map(renderCollapsedButton)}
        
        {/* My Planning Document - Collapsed */}
        <hr className="my-3 border-border" />
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/preplan-summary")}
                className="w-full flex items-center justify-center p-3 rounded-lg transition-all bg-primary/10 hover:bg-primary/20 text-primary"
              >
                <FileText className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p className="font-medium">My Planning Document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    );
  }

  // BROWSE MODE (full navigation)
  return (
    <nav className="space-y-4">
      {/* Grouped Sections */}
      {getGroupedSections()}
      
      {/* Ungrouped Sections (if any) */}
      {getUngroupedSections().length > 0 && sectionGroups.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
            Other Sections
          </h4>
          <div className="space-y-1">
            {getUngroupedSections().map(item => renderNavButton(item, false))}
          </div>
        </div>
      )}

      {/* Fallback: If no groups, show flat list */}
      {sectionGroups.length === 0 && (
        <div className="space-y-1">
          {userSections.map(item => renderNavButton(item))}
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

      {/* My Planning Document - Primary Access */}
      <>
        <hr className="my-4 border-2 border-border mx-4" />
        <div className="px-2">
          <button
            onClick={() => navigate("/preplan-summary")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-4 text-base rounded-lg transition-all duration-200 text-left group",
              "bg-primary/10 hover:bg-primary/20 border-2 border-primary/30",
              "text-foreground font-medium"
            )}
          >
            <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
            <span className="flex-1">My Planning Document</span>
          </button>
        </div>
      </>

      {/* Support & Services Section */}
      {!hideResources && (
        <>
          <hr className="my-4 border-2 border-border mx-4" />

          <div className="space-y-1 mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
              Support & Services
            </h4>
            {supportServicesItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => navigate(item.route)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg transition-all duration-200 text-left group",
                      "hover:bg-accent/50",
                      "text-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
};