import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import { getSectionIcon } from "@/lib/sectionIcons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText, ClipboardList, User, Heart, Home as HomeIcon, Shield, Users, Dog, MessageSquare, BookOpen, HelpCircle } from "lucide-react";

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

// FINAL navigation order as specified - NO BROWSE MODE
const NAV_SECTIONS = [
  { id: "preplanning", label: "Pre-Planning Checklist", icon: ClipboardList },
  { id: "personal", label: "About You", icon: User },
  { id: "healthcare", label: "Medical & Care Preferences", icon: Heart },
  { id: "funeral", label: "Funeral Wishes", icon: Heart },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "contacts", label: "Important Contacts", icon: Users },
  { id: "property", label: "Property & Valuables", icon: HomeIcon },
  { id: "pets", label: "Pets", icon: Dog },
  { id: "messages", label: "Messages to Loved Ones", icon: MessageSquare },
];

const RESOURCE_SECTIONS = [
  { id: "resources", label: "Resources", icon: BookOpen, route: "/resources" },
  { id: "faq", label: "FAQs", icon: HelpCircle, route: "/faq" },
];

export const SidebarNav = ({ 
  items, 
  activeSection, 
  onSectionChange,
}: SidebarNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get completion status from items
  const getCompletionStatus = (sectionId: string) => {
    const item = items.find(i => i.id === sectionId);
    return item?.completed || false;
  };

  const renderNavButton = (section: { id: string; label: string; icon: any }, showDot: boolean = true) => {
    const Icon = section.icon;
    const completed = getCompletionStatus(section.id);
    
    return (
      <button
        key={section.id}
        onClick={() => onSectionChange(section.id)}
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
        {showDot && <ProgressDot completed={completed} />}
      </button>
    );
  };

  const renderResourceButton = (section: { id: string; label: string; icon: any; route: string }) => {
    const Icon = section.icon;
    
    return (
      <button
        key={section.id}
        onClick={() => navigate(section.route)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg transition-all duration-200 text-left group",
          "hover:bg-accent/50 text-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <span className="flex-1">{section.label}</span>
      </button>
    );
  };

  return (
    <nav className="space-y-1">
      {/* Main Sections */}
      {NAV_SECTIONS.map(section => renderNavButton(section))}

      {/* Divider */}
      <hr className="my-4 border-border mx-4" />

      {/* Resources Section */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
          Help & Resources
        </h4>
        {RESOURCE_SECTIONS.map(section => renderResourceButton(section))}
      </div>

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
          <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="flex-1">Printable Copy</span>
        </button>
        <p className="text-sm text-muted-foreground mt-2 px-4">
          You can print or save your plan anytime.
        </p>
      </div>
    </nav>
  );
};
