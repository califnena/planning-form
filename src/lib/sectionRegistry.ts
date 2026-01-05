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
    id: "preplanning",
    label: "Pre-Planning Checklist",
    icon: ClipboardList,
    route: "/preplandashboard/checklist",
    dataKey: "preplanning",
    group: "aboutyou",
    showCompletionDot: true,
  },
  {
    id: "personal",
    label: "About You",
    icon: User,
    route: "/preplandashboard/personal-family",
    dataKey: "personal",
    group: "aboutyou",
    showCompletionDot: true,
  },
  {
    id: "address",
    label: "Address",
    icon: MapPin,
    route: "/preplandashboard/address",
    dataKey: "address",
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
  {
    id: "healthcare",
    label: "Medical & Care Preferences",
    icon: Stethoscope,
    route: "/preplandashboard/health-care",
    dataKey: "healthcare",
    group: "aboutyou",
    showCompletionDot: true,
  },
  {
    id: "advancedirective",
    label: "Advance Directive",
    icon: Heart,
    route: "/preplandashboard/advance-directive",
    dataKey: "advance_directive",
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
