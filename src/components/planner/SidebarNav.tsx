import { ProgressDot } from "./ProgressDot";
import { cn } from "@/lib/utils";

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
  return (
    <nav className="space-y-1">
      {items.map((item) => (
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
      ))}
    </nav>
  );
};
