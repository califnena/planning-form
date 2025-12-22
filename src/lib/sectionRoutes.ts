/**
 * Section Routes - Single source of truth for section navigation
 * Used by PrePlanSummary, PdfReadinessModal, and any other deep-linking needs
 */

// Section route mapping for deep-linking from summary/modals to specific planner sections
export const SECTION_ROUTES: Record<string, string> = {
  personal: "/preplandashboard?section=personal",
  contacts: "/preplandashboard?section=contacts",
  funeral: "/preplandashboard?section=funeral",
  legacy: "/preplandashboard?section=legacy",
  legal: "/preplandashboard?section=legal",
  financial: "/preplandashboard?section=financial",
  insurance: "/preplandashboard?section=insurance",
  property: "/preplandashboard?section=property",
  pets: "/preplandashboard?section=pets",
  digital: "/preplandashboard?section=digital",
  messages: "/preplandashboard?section=messages",
  preferences: "/preplandashboard?section=preferences",
  overview: "/preplandashboard?section=overview",
  checklist: "/preplandashboard?section=checklist",
  legalresources: "/preplandashboard?section=legalresources",
  willprep: "/preplandashboard?section=willprep",
  providers: "/preplandashboard?section=providers",
};

// Section labels for display
export const SECTION_LABELS: Record<string, string> = {
  personal: "Personal & Family Details",
  contacts: "Key Contacts to Notify",
  funeral: "Funeral Wishes",
  legacy: "Life Story & Legacy",
  legal: "Legal Documents",
  financial: "Financial Life",
  insurance: "Insurance",
  property: "Property & Valuables",
  pets: "Pet Care",
  digital: "Digital Accounts",
  messages: "Messages to Loved Ones",
  preferences: "Preferences",
  overview: "Overview",
  checklist: "Checklist",
  legalresources: "Legal Resources",
  willprep: "Will Preparation",
  providers: "Service Providers",
};

/**
 * Get the route for a specific section
 * Falls back to /preplandashboard if section not found
 */
export function getSectionRoute(sectionId: string, focusField?: string): string {
  const baseRoute = SECTION_ROUTES[sectionId] || "/preplandashboard";
  
  if (focusField) {
    return `${baseRoute}&focus=${focusField}`;
  }
  
  return baseRoute;
}

/**
 * Get the section label for display
 */
export function getSectionLabel(sectionId: string): string {
  return SECTION_LABELS[sectionId] || sectionId;
}
