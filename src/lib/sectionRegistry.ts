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
  Wallet
} from "lucide-react";

export interface SectionDefinition {
  id: string;
  label: string;
  icon: any;
  route: string;
  /** Key used in plan_payload and completion detection */
  dataKey: string;
  /** Group this section belongs to */
  group: "top" | "preplanning" | "wishes" | "records" | "help";
  /** Whether to show completion dot in nav */
  showCompletionDot: boolean;
}

// ============= SECTION DEFINITIONS =============
// ORDERED per specification:
// Pre-Planning Checklist → About You → Medical & Care → Advance Directive
// → Funeral Wishes → Insurance → Important Contacts → Property → Pets
// → Messages → Resources → FAQs → Printable Copy

export const SECTION_REGISTRY: SectionDefinition[] = [
  // TOP (no completion dots)
  {
    id: "home",
    label: "Home",
    icon: HomeIcon,
    route: "/dashboard",
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

  // PRE-PLANNING AREA (order: checklist, medical, advance directive, travel)
  {
    id: "preplanning",
    label: "Pre-Planning Checklist",
    icon: ClipboardList,
    route: "/preplandashboard/checklist",
    dataKey: "preplanning",
    group: "preplanning",
    showCompletionDot: true,
  },
  {
    id: "personal",
    label: "About You",
    icon: User,
    route: "/preplandashboard/personal-family",
    dataKey: "personal",
    group: "preplanning",
    showCompletionDot: true,
  },
  {
    id: "healthcare",
    label: "Medical & Care Preferences",
    icon: Stethoscope,
    route: "/preplandashboard/health-care",
    dataKey: "healthcare",
    group: "preplanning",
    showCompletionDot: true,
  },
  {
    id: "advancedirective",
    label: "Advance Directive",
    icon: Heart,
    route: "/preplandashboard/advance-directive",
    dataKey: "advance_directive",
    group: "preplanning",
    showCompletionDot: true,
  },

  // YOUR WISHES (order: funeral, insurance, contacts, financial, property, pets, messages)
  {
    id: "funeral",
    label: "Funeral Wishes",
    icon: Heart,
    route: "/preplandashboard/funeral-wishes",
    dataKey: "funeral",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: Shield,
    route: "/preplandashboard/insurance",
    dataKey: "insurance",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "contacts",
    label: "Important Contacts",
    icon: Users,
    route: "/preplandashboard/contacts",
    dataKey: "contacts",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "financial",
    label: "Financial Life",
    icon: Wallet,
    route: "/preplandashboard/financial-life",
    dataKey: "financial",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "property",
    label: "Property & Valuables",
    icon: HomeIcon,
    route: "/preplandashboard/property-valuables",
    dataKey: "property",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "pets",
    label: "Pets",
    icon: Dog,
    route: "/preplandashboard/pets",
    dataKey: "pets",
    group: "wishes",
    showCompletionDot: true,
  },
  {
    id: "messages",
    label: "Messages to Loved Ones",
    icon: MessageSquare,
    route: "/preplandashboard/messages",
    dataKey: "messages",
    group: "wishes",
    showCompletionDot: true,
  },

  // IMPORTANT RECORDS (travel, digital)
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
    id: "digital",
    label: "Online Accounts",
    icon: Laptop,
    route: "/preplandashboard/digital",
    dataKey: "digital",
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
