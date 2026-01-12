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

  // Group accent colors for visual orientation
  const groupAccentStyles: Record<SectionDefinition["group"], string> = {
    top: "",
    aboutyou: "bg-[hsl(var(--section-aboutyou))] border-l-4 border-l-[hsl(var(--section-aboutyou-border))]",
    yourwishes: "bg-[hsl(var(--section-yourwishes))] border-l-4 border-l-[hsl(var(--section-yourwishes-border))]",
    records: "bg-[hsl(var(--section-records))] border-l-4 border-l-[hsl(var(--section-records-border))]",
    help: "bg-[hsl(var(--section-help))] border-l-4 border-l-[hsl(var(--section-help-border))]",
  };

  const renderSectionGroup = (title: string, group: SectionDefinition["group"]) => {
    const sections = getSectionsByGroup(group);
    if (sections.length === 0) return null;
    
    const accentStyle = groupAccentStyles[group];
    
    return (
      <div className={cn("space-y-1 rounded-lg py-2 px-1", accentStyle)}>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
          {title}
        </h4>
        {sections.map(section => renderNavButton(section))}
      </div>
    );
  };

  // Get top sections
  const topSections = getSectionsByGroup("top");

  return (
    <nav className="space-y-2">
      {/* Top Navigation */}
      {topSections.map(section => renderNavButton(section))}

      {/* About You */}
      <div className="pt-3">
        {renderSectionGroup("About You", "aboutyou")}
      </div>

      {/* Your Wishes */}
      <div className="pt-2">
        {renderSectionGroup("Your Wishes", "yourwishes")}
      </div>

      {/* Important Records */}
      <div className="pt-2">
        {renderSectionGroup("Important Records", "records")}
      </div>

      {/* Help & Education */}
      <div className="pt-2">
        {renderSectionGroup("Help & Education", "help")}
      </div>

      {/* Printable Copy - Primary Access */}
      <div className="pt-4 mt-2 border-t-2 border-border px-2">
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
