/**
 * Section Routes - Single source of truth for section navigation
 * Used by PrePlanSummary, PdfReadinessModal, and any other deep-linking needs
 * 
 * TRUE ROUTES: Each section has its own URL path
 */

// Section route mapping for deep-linking from summary/modals to specific planner sections
export const SECTION_ROUTES: Record<string, string> = {
  personal: "/preplandashboard/personal-family",
  contacts: "/preplandashboard/contacts",
  funeral: "/preplandashboard/funeral-wishes",
  legacy: "/preplandashboard/life-story",
  legal: "/preplandashboard/legal-docs",
  financial: "/preplandashboard/financial-life",
  insurance: "/preplandashboard/insurance",
  property: "/preplandashboard/property-valuables",
  pets: "/preplandashboard/pets",
  digital: "/preplandashboard/digital",
  messages: "/preplandashboard/messages",
  preferences: "/preplandashboard/preferences",
  overview: "/preplandashboard/overview",
  checklist: "/preplandashboard/checklist",
  legalresources: "/preplandashboard/legalresources",
  willprep: "/preplandashboard/willprep",
  providers: "/preplandashboard/providers",
  instructions: "/preplandashboard/instructions",
  healthcare: "/preplandashboard/health-care",
  carepreferences: "/preplandashboard/care-preferences",
  preplanning: "/preplandashboard/pre-planning",
};

// Section labels for display - FINAL senior-friendly naming
export const SECTION_LABELS: Record<string, string> = {
  preplanning: "Pre-Planning Checklist",
  personal: "About You",
  healthcare: "Medical & Care Preferences",
  carepreferences: "Care Preferences",
  funeral: "Funeral Wishes",
  insurance: "Insurance",
  contacts: "Important Contacts",
  property: "Property & Valuables",
  pets: "Pets",
  messages: "Messages to Loved Ones",
  resources: "Resources",
  faq: "FAQs",
  printableplan: "My Printable Plan",
  // Legacy section IDs for backwards compatibility
  legacy: "Life Story & Legacy",
  legal: "Legal Documents",
  financial: "Financial Life",
  digital: "Digital Accounts",
  preferences: "Preferences",
  overview: "Overview",
  checklist: "Checklist",
  legalresources: "Legal Resources",
  willprep: "Will Preparation",
  providers: "Service Providers",
  instructions: "Instructions",
};

/**
 * Get the route for a specific section
 * Falls back to /preplandashboard/preferences if section not found
 */
export function getSectionRoute(sectionId: string, focusField?: string): string {
  const baseRoute = SECTION_ROUTES[sectionId] || "/preplandashboard/preferences";
  
  if (focusField) {
    return `${baseRoute}?focus=${focusField}`;
  }
  
  return baseRoute;
}

/**
 * Get the section label for display
 */
export function getSectionLabel(sectionId: string): string {
  return SECTION_LABELS[sectionId] || sectionId;
}
