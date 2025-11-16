export interface Section {
  id: string;
  title: string;
  description?: string;
}

export const ALL_SECTIONS: Section[] = [
  { id: "overview", title: "Planning Overview (Checklist)", description: "Quick checklist to get started." },
  { id: "instructions", title: "My Instructions", description: "Your message and instructions to family." },
  { id: "personal", title: "Personal & Family Details", description: "Basic identity and family details." },
  { id: "legacy", title: "Life Story & Legacy", description: "Life story and highlights." },
  { id: "contacts", title: "Important People to Notify", description: "Who to notify and professional contacts." },
  { id: "providers", title: "Service Providers & Arrangements", description: "Funeral home and service vendors." },
  { id: "funeral", title: "Funeral Wishes", description: "Service preferences and disposition." },
  { id: "financial", title: "Financial Life", description: "Accounts and funeral funding." },
  { id: "insurance", title: "Insurance & Benefits", description: "Policies and contacts." },
  { id: "property", title: "Property & Valuables", description: "Homes, vehicles, valuables." },
  { id: "pets", title: "Pet Care Instructions", description: "Care plan and vet info." },
  { id: "digital", title: "Digital World", description: "Phones, passwords, social." },
  { id: "legal", title: "Legal (Will/Trust)", description: "Will, trust, directives." },
  { id: "messages", title: "Letters & Personal Messages", description: "Letters to loved ones." },
];

export const REQUIRED_SECTIONS: Section[] = [
  { id: "resources", title: "Helpful Resources", description: "Guides and references." },
  { id: "faq", title: "Common Questions", description: "Plain answers to common questions." },
];

export const SETTINGS_DEFAULT = ["overview", "funeral", "personal", "legacy", "contacts", "providers", "financial", "insurance", "property", "messages"];

export function mergeVisibleSections(selected: string[] | null): Section[] {
  const userSet = new Set(selected && selected.length ? selected : SETTINGS_DEFAULT);
  const userSections = ALL_SECTIONS.filter(s => userSet.has(s.id));
  return [...userSections, ...REQUIRED_SECTIONS];
}
