import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  ClipboardList, 
  User, 
  Heart, 
  Home as HomeIcon, 
  Shield, 
  Users, 
  Dog, 
  MessageSquare, 
  BookOpen, 
  HelpCircle,
  Stethoscope,
  Plane,
  Printer
} from "lucide-react";

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

// Navigation structure per spec
const TOP_SECTIONS = [
  { id: "home", label: "Home", icon: HomeIcon, route: "/dashboard" },
  { id: "plansummary", label: "Your Plan Summary", icon: FileText, route: "/preplan-summary" },
];

const PREPLANNING_SECTIONS = [
  { id: "preplanning", label: "Pre-Planning Checklist", icon: ClipboardList },
  { id: "healthcare", label: "Medical & Care Preferences", icon: Stethoscope },
  { id: "advancedirective", label: "Advance Directive & DNR Status", icon: Heart },
  { id: "travel", label: "Travel & Away-From-Home Plan", icon: Plane },
];

const WISHES_SECTIONS = [
  { id: "funeral", label: "Funeral Wishes", icon: Heart },
  { id: "messages", label: "Messages to Loved Ones", icon: MessageSquare },
];

const RECORDS_SECTIONS = [
  { id: "contacts", label: "Important Contacts", icon: Users },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "property", label: "Property & Valuables", icon: HomeIcon },
  { id: "digital", label: "Online Accounts", icon: BookOpen },
];

const HELP_SECTIONS = [
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

  const getCompletionStatus = (sectionId: string) => {
    const item = items.find(i => i.id === sectionId);
    return item?.completed || false;
  };

  const renderNavButton = (
    section: { id: string; label: string; icon: any; route?: string }, 
    showDot: boolean = true
  ) => {
    const Icon = section.icon;
    const completed = getCompletionStatus(section.id);
    
    const handleClick = () => {
      if (section.route) {
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
        {showDot && !section.route && <ProgressDot completed={completed} />}
      </button>
    );
  };

  const renderSectionGroup = (
    title: string, 
    sections: { id: string; label: string; icon: any; route?: string }[],
    showDots: boolean = true
  ) => (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
        {title}
      </h4>
      {sections.map(section => renderNavButton(section, showDots))}
    </div>
  );

  return (
    <nav className="space-y-1">
      {/* Top Navigation */}
      {TOP_SECTIONS.map(section => renderNavButton(section, false))}

      {/* Pre-Planning Area */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Pre-Planning Area", PREPLANNING_SECTIONS)}

      {/* Your Wishes */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Your Wishes", WISHES_SECTIONS)}

      {/* Important Records */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Important Records", RECORDS_SECTIONS)}

      {/* Help & Education */}
      <hr className="my-4 border-border mx-4" />
      {renderSectionGroup("Help & Education", HELP_SECTIONS, false)}

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
