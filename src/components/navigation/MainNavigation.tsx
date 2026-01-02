import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileEdit, BookOpen, Library, HelpCircle } from "lucide-react";

interface MainNavigationProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

const navItems = [
  { 
    id: "planner", 
    label: "Planner", 
    href: "/preplandashboard", 
    icon: FileEdit,
    description: "Fill out your plan"
  },
  { 
    id: "guide", 
    label: "Guide", 
    href: "/guide", 
    icon: BookOpen,
    description: "Learn before you fill"
  },
  { 
    id: "resources", 
    label: "Resources", 
    href: "/resources", 
    icon: Library,
    description: "Helpful information"
  },
  { 
    id: "faq", 
    label: "FAQ", 
    href: "/faq", 
    icon: HelpCircle,
    description: "Common questions"
  },
];

export function MainNavigation({ className, variant = "horizontal" }: MainNavigationProps) {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (href === "/preplandashboard") {
      return location.pathname.startsWith("/preplandashboard");
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };
  
  if (variant === "vertical") {
    return (
      <nav className={cn("space-y-1", className)}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-lg transition-colors text-left",
                "hover:bg-accent/50",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                active ? "text-primary" : "text-muted-foreground"
              )} />
              <div>
                <span className="block text-base">{item.label}</span>
                <span className="block text-sm text-muted-foreground">{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    );
  }
  
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors",
              "hover:bg-accent/50 text-base",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-5 w-5",
              active ? "text-primary" : "text-muted-foreground"
            )} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
