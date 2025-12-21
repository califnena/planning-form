import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import { getSectionIcon, getSectionColor } from "@/lib/sectionIcons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Package, Heart, UserCheck } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  completed: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  hideResources?: boolean; // Hide Help & Resources section for focused flow
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
  hideResources = false
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

  // All items are now user sections (no more always-visible "resources" sections)
  const userSections = items;

  const renderNavButton = (item: NavItem) => {
    const Icon = getSectionIcon(item.id);
    const colorGradient = getSectionColor(item.id);
    
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
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
          colorGradient
        )}>
          <Icon className="h-4 w-4 text-white" />
        </div>
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
          <h3 className="text-base font-bold text-foreground mb-2 uppercase tracking-wide text-center">
            {t("sidebar.yourPlanningSteps")}
          </h3>
          <p className="text-xs text-muted-foreground text-center mb-3 px-2">
            {t("sidebar.completeAnyOrder")}
          </p>
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

      {/* Support & Services Section */}
      {!hideResources && (
        <>
          {/* Divider */}
          <hr className="my-4 border-2 border-border mx-4" />

          <div className="space-y-1 mt-6">
            <h3 className="text-base font-bold text-foreground mb-3 uppercase tracking-wide text-center">
              Support & Services
            </h3>
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