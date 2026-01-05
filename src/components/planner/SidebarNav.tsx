import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";
import { 
  SECTION_REGISTRY, 
  getSectionsByGroup,
  type SectionDefinition 
} from "@/lib/sectionRegistry";

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

export const SidebarNav = ({ 
  items, 
  activeSection, 
  onSectionChange,
}: SidebarNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getCompletionStatus = (sectionId: string) => {
    const item = items.find(i => i.id === sectionId);
    return item?.completed || false;
  };

  const renderNavButton = (section: SectionDefinition) => {
    const Icon = section.icon;
    const completed = getCompletionStatus(section.id);
    
    const handleClick = () => {
      if (section.route.startsWith("/") && !section.route.startsWith("/preplandashboard")) {
        navigate(section.route);
      } else {
        onSectionChange(section.id);
      }
    };
    
    return (
      <button
        key={section.id}
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg transition-all duration-200 text-left group",
          "hover:bg-accent/50",
          activeSection === section.id
            ? "bg-primary/10 text-primary font-semibold"
            : "text-foreground hover:text-foreground"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0",
          activeSection === section.id ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="flex-1">{section.label}</span>
        {section.showCompletionDot && <ProgressDot completed={completed} />}
      </button>
    );
  };

  const renderSectionGroup = (title: string, group: SectionDefinition["group"]) => {
    const sections = getSectionsByGroup(group);
    if (sections.length === 0) return null;
    
    return (
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
          {title}
        </h4>
        {sections.map(section => renderNavButton(section))}
      </div>
    );
  };

  // Get top sections
  const topSections = getSectionsByGroup("top");

  return (
    <nav className="space-y-1">
      {/* Top Navigation */}
      {topSections.map(section => renderNavButton(section))}

      {/* About You */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("About You", "aboutyou")}

      {/* Your Wishes */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Your Wishes", "yourwishes")}

      {/* Important Records */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Important Records", "records")}

      {/* Help & Education */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Help & Education", "help")}

      {/* Printable Copy - Primary Access */}
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
          <Printer className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="flex-1">Printable Copy</span>
        </button>
        <p className="text-sm text-muted-foreground mt-2 px-4">
          You can print or save your plan anytime.
        </p>
      </div>
    </nav>
  );
};
