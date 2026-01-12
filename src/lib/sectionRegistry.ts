/**
 * UNIFIED SECTION REGISTRY
 * 
 * This is the SINGLE SOURCE OF TRUTH for:
 * - Left navigation (SidebarNav)
 * - Plan Summary "View/Edit sections" list
 * - PDF generation section mapping
 * - Completion detection keys
 * 
 * DO NOT define section lists elsewhere. Import from here.
 * 
 * ORDER MATCHES PDF TABLE OF CONTENTS:
 * Checklist → Personal Info → Life Story → Medical & Care → Advance Directive
 * → People to Notify → Funeral Wishes → Messages
 * → Financial → Insurance → Property → Pets → Online Accounts → Signature
 */

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
  Laptop,
  Wallet,
  MapPin,
  Building
} from "lucide-react";

export interface SectionDefinition {
  id: string;
  label: string;
  icon: any;
  route: string;
  /** Key used in plan_payload and completion detection */
  dataKey: string;
  /** Group this section belongs to */
  group: "top" | "aboutyou" | "yourwishes" | "records" | "help";
  /** Whether to show completion dot in nav */
  showCompletionDot: boolean;
}

// ============= SECTION DEFINITIONS =============
// ORDER MATCHES PDF TABLE OF CONTENTS

export const SECTION_REGISTRY: SectionDefinition[] = [
  // TOP (no completion dots)
  {
    id: "home",
    label: "Planning Menu",
    icon: HomeIcon,
    route: "/preplandashboard/overview",
    dataKey: "",
    group: "top",
    showCompletionDot: false,
  },
  {
    id: "plansummary",
    label: "Your Plan Summary",
    icon: FileText,
    route: "/preplan-summary",
    dataKey: "",
    group: "top",
    showCompletionDot: false,
  },

  // ABOUT YOU - Personal information sections
  {
    id: "personal_info",
    label: "Personal Information",
    icon: User,
    route: "/preplandashboard/personal-info",
    dataKey: "personal_information",
    group: "aboutyou",
    showCompletionDot: true,
  },
  {
    id: "about_you",
    label: "About You",
    icon: Users,
    route: "/preplandashboard/about-you",
    dataKey: "about_you",
    group: "aboutyou",
    showCompletionDot: true,
  },
  {
    id: "legacy",
    label: "Life Story & Legacy",
    icon: BookOpen,
    route: "/preplandashboard/life-story",
    dataKey: "legacy",
    group: "aboutyou",
    showCompletionDot: true,
  },

  // YOUR WISHES - What you want and who to tell
  {
    id: "contacts",
    label: "People to Notify",
    icon: Users,
    route: "/preplandashboard/contacts",
    dataKey: "people_to_notify",
    group: "yourwishes",
    showCompletionDot: true,
  },
  {
    id: "funeral",
    label: "Funeral Wishes",
    icon: Heart,
    route: "/preplandashboard/funeral-wishes",
    dataKey: "funeral",
    group: "yourwishes",
    showCompletionDot: true,
  },
  {
    id: "messages",
    label: "Messages to Loved Ones",
    icon: MessageSquare,
    route: "/preplandashboard/messages",
    dataKey: "messages",
    group: "yourwishes",
    showCompletionDot: true,
  },

  // IMPORTANT RECORDS - Assets, accounts, documents
  {
    id: "financial",
    label: "Financial Life",
    icon: Wallet,
    route: "/preplandashboard/financial-life",
    dataKey: "financial",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: Shield,
    route: "/preplandashboard/insurance",
    dataKey: "insurance",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "property",
    label: "Property & Valuables",
    icon: Building,
    route: "/preplandashboard/property-valuables",
    dataKey: "property",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "pets",
    label: "Pets",
    icon: Dog,
    route: "/preplandashboard/pets",
    dataKey: "pets",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "digital",
    label: "Online Accounts",
    icon: Laptop,
    route: "/preplandashboard/digital",
    dataKey: "digital",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "travel",
    label: "Travel & Away-From-Home",
    icon: Plane,
    route: "/preplandashboard/travel-planning",
    dataKey: "travel",
    group: "records",
    showCompletionDot: true,
  },
  {
    id: "signature",
    label: "Review & Signature",
    icon: FileText,
    route: "/preplandashboard/signature",
    dataKey: "signature",
    group: "records",
    showCompletionDot: true,
  },

  // HELP & EDUCATION (no completion dots)
  {
    id: "resources",
    label: "Resources",
    icon: BookOpen,
    route: "/resources",
    dataKey: "",
    group: "help",
    showCompletionDot: false,
  },
  {
    id: "faq",
    label: "FAQs",
    icon: HelpCircle,
    route: "/faq",
    dataKey: "",
    group: "help",
    showCompletionDot: false,
  },
];

// ============= HELPER FUNCTIONS =============

/** Get sections by group */
export function getSectionsByGroup(group: SectionDefinition["group"]): SectionDefinition[] {
  return SECTION_REGISTRY.filter((s) => s.group === group);
}

/** Get all sections that can be completed (have dataKey) */
export function getCompletableSections(): SectionDefinition[] {
  return SECTION_REGISTRY.filter((s) => s.dataKey && s.showCompletionDot);
}

/** Get section by id */
export function getSectionById(id: string): SectionDefinition | undefined {
  return SECTION_REGISTRY.find((s) => s.id === id);
}

/** Get section by route */
export function getSectionByRoute(route: string): SectionDefinition | undefined {
  return SECTION_REGISTRY.find((s) => s.route === route);
}

/** Get route for a section */
export function getSectionRoute(sectionId: string): string {
  const section = getSectionById(sectionId);
  return section?.route || "/preplandashboard";
}

/** Get label for a section */
export function getSectionLabel(sectionId: string): string {
  const section = getSectionById(sectionId);
  return section?.label || sectionId;
}

/** Get dataKey for a section */
export function getSectionDataKey(sectionId: string): string {
  const section = getSectionById(sectionId);
  return section?.dataKey || sectionId;
}

// ============= NAVIGATION HELPERS =============

/**
 * Get the navigable sections in order (excludes top nav items like home/plansummary and help items)
 * This is the SINGLE SOURCE OF TRUTH for section navigation order
 */
export function getNavigableSections(): SectionDefinition[] {
  return SECTION_REGISTRY.filter(
    (s) => s.group !== "top" && s.group !== "help" && s.showCompletionDot
  );
}

/**
 * Check if a route is in the registry
 */
export function isRegistryRoute(route: string): boolean {
  return SECTION_REGISTRY.some((s) => s.route === route);
}

/**
 * Get the next and previous routes for a given section
 * - If first section, back goes to overview
 * - If last section, next goes to plan summary
 */
export function getSectionNavigation(sectionId: string): {
  prevRoute: string;
  nextRoute: string;
  isFirst: boolean;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
} {
  const navigable = getNavigableSections();
  const currentIndex = navigable.findIndex((s) => s.id === sectionId);
  
  // Default fallback if section not found
  if (currentIndex === -1) {
    return {
      prevRoute: "/preplandashboard/overview",
      nextRoute: "/preplan-summary",
      isFirst: true,
      isLast: true,
      currentStep: 0,
      totalSteps: navigable.length,
    };
  }
  
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === navigable.length - 1;
  
  const prevRoute = isFirst 
    ? "/preplandashboard/overview" 
    : navigable[currentIndex - 1].route;
    
  const nextRoute = isLast 
    ? "/preplan-summary" 
    : navigable[currentIndex + 1].route;
  
  return { 
    prevRoute, 
    nextRoute, 
    isFirst, 
    isLast,
    currentStep: currentIndex + 1,
    totalSteps: navigable.length,
  };
}

/**
 * Get navigation info by current route path
 * If route is not in registry, returns safe defaults pointing to Overview
 */
export function getSectionNavigationByRoute(currentRoute: string): {
  sectionId: string | null;
  prevRoute: string;
  nextRoute: string;
  isFirst: boolean;
  isLast: boolean;
  isRegistrySection: boolean;
  currentStep: number;
  totalSteps: number;
} {
  const section = getSectionByRoute(currentRoute);
  const navigable = getNavigableSections();
  
  // Non-registry route: provide safe navigation back to overview
  if (!section) {
    return {
      sectionId: null,
      prevRoute: "/preplandashboard/overview",
      nextRoute: "/preplandashboard/overview",
      isFirst: true,
      isLast: true,
      isRegistrySection: false,
      currentStep: 0,
      totalSteps: navigable.length,
    };
  }
  
  const nav = getSectionNavigation(section.id);
  return {
    sectionId: section.id,
    ...nav,
    isRegistrySection: true,
  };
}

// ============= NON-REGISTRY ROUTES (AUDIT) =============
// The following routes exist in App.tsx but are NOT in SECTION_REGISTRY.
// Users should not navigate to these via Back/Next buttons.
// Decision: "Remove from flow" - they can be reached via direct URL only.
//
// /preplandashboard/preferences - Settings page, not a section
// /preplandashboard/pre-planning - Redundant with overview
// /preplandashboard/health-care - Merged into care-preferences (not in registry)
// /preplandashboard/personal-family - Merged into about-you
// /preplandashboard/legal-docs - Not senior-focused
// /preplandashboard/providers - Not senior-focused
// /preplandashboard/checklist - Moved to pre-planning area (not in registry)
// /preplandashboard/instructions - Merged elsewhere
// /preplandashboard/legalresources - External resource link
// /preplandashboard/willprep - Not senior-focused
