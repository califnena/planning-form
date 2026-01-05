export interface Section {
  id: string;
  title: string;
  description?: string;
}

// FINAL NAVIGATION ORDER (LOCKED)
export const ALL_SECTIONS: Section[] = [
  { id: "preplanning", title: "Pre-Planning Checklist", description: "A gentle orientation to help you get started." },
  { id: "personal", title: "About You", description: "Basic information about you." },
  { id: "healthcare", title: "Medical & Care Preferences", description: "Medical conditions, medications, and care preferences." },
  { id: "travel", title: "Travel & Away-From-Home", description: "Planning for travel or time away from home." },
  { id: "funeral", title: "Funeral Wishes", description: "The kind of service you want, music, readings, and more." },
  { id: "insurance", title: "Insurance", description: "Life insurance, pensions, and benefits information." },
  { id: "contacts", title: "People to Notify", description: "People who should be contacted." },
  { id: "property", title: "Property & Valuables", description: "Homes, vehicles, and valuables." },
  { id: "pets", title: "Pets", description: "Who will care for your pets." },
  { id: "messages", title: "Messages to Loved Ones", description: "Letters and messages for family and friends." },
];

export const RESOURCE_SECTIONS: Section[] = [
  { id: "resources", title: "Resources", description: "Helpful guides and references." },
  { id: "faq", title: "FAQs", description: "Plain answers to common questions." },
];

export const REQUIRED_SECTIONS: Section[] = [
  { id: "printableplan", title: "My Printable Plan", description: "View or print your planning document." },
];

export const SETTINGS_DEFAULT = ["preplanning", "personal", "healthcare", "travel", "funeral", "insurance", "contacts", "property", "pets", "messages"];

export function mergeVisibleSections(selected: string[] | null): Section[] {
  const userSet = new Set(selected && selected.length ? selected : SETTINGS_DEFAULT);
  const userSections = ALL_SECTIONS.filter(s => userSet.has(s.id));
  return [...userSections, ...RESOURCE_SECTIONS, ...REQUIRED_SECTIONS];
}
