import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  "/": "Home",
  "/plan-ahead": "Plan Ahead",
  "/after-death": "After Death",
  "/dashboard": "Dashboard",
  "/resources": "Resources",
  "/pricing": "Pricing",
  "/guide": "Guide",
  "/faq": "FAQ",
  "/contact": "Contact",
  "/about-us": "About Us",
  "/products": "Products",
  "/products/binder": "Fireproof Binder",
  "/products/custom-song": "Custom Memorial Song",
  "/vip-coach": "Planning Support",
  "/app": "Planner",
  "/preplandashboard": "Pre-Plan Dashboard",
  "/legal-forms": "Legal Forms",
  "/legal-documents": "Legal Documents",
  "/events": "Events",
  "/vendors": "Vendors",
  "/travel-protection": "Travel Protection",
};

/**
 * Breadcrumb navigation component.
 * If items prop is provided, uses those. Otherwise, auto-generates from URL.
 */
export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      
      // Last item doesn't get a link
      if (index === pathSegments.length - 1) {
        crumbs.push({ label });
      } else {
        crumbs.push({ label, href: currentPath });
      }
    });
    
    return crumbs;
  })();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-muted-foreground ${className}`}>
      <ol className="flex items-center gap-1 flex-wrap">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="h-3 w-3" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
