export interface Section {
  id: string;
  title: string;
  description?: string;
}

export const ALL_SECTIONS: Section[] = [
  { id: "overview", title: "Planning Overview", description: "A simple checklist of the most important items." },
  { id: "instructions", title: "My Instructions", description: "Notes for your loved ones about what you want." },
  { id: "personal", title: "Personal and Family Details", description: "Basic information about you and the people in your life." },
  { id: "legacy", title: "Life Story & Legacy", description: "Your memories, achievements, and ideas for your obituary." },
  { id: "contacts", title: "Important People to Notify", description: "People who should be contacted during a difficult time." },
  { id: "providers", title: "Service Providers & Arrangements", description: "Funeral homes, churches, and other service contacts." },
  { id: "funeral", title: "Funeral & Ceremony Wishes", description: "The kind of service you want, music, readings, and more." },
  { id: "financial", title: "Financial Life", description: "Where your accounts are, bills, debts, and important details." },
  { id: "insurance", title: "Insurance & Benefits", description: "Life insurance, pensions, Social Security, and other benefits." },
  { id: "property", title: "Property & Valuables", description: "Homes, vehicles, valuables, and how you want them handled." },
  { id: "pets", title: "Pet Care Instructions", description: "Who will care for your pets and what they need." },
  { id: "digital", title: "Online Accounts", description: "Passwords, devices, and important digital information." },
  { id: "legal", title: "Legal Document Storage", description: "Keep track of where your will, trust, and legal documents are stored." },
  { id: "messages", title: "Letters & Personal Messages", description: "Messages you want to leave for loved ones." },
  { id: "willprep", title: "Prepare Information for a Will", description: "Organize your wishes and create a draft to review with an attorney." },
];

export const REQUIRED_SECTIONS: Section[] = [
  { id: "preferences", title: "Preferences", description: "Choose which topics apply to you." },
  { id: "legalresources", title: "Legal Documents & Resources", description: "Essential legal forms and guides." },
  { id: "resources", title: "Helpful Resources", description: "Guides and references." },
  { id: "faq", title: "Common Questions", description: "Plain answers to common questions." },
];

export const SETTINGS_DEFAULT = ["overview", "funeral", "personal", "legacy", "contacts", "providers", "financial", "insurance", "property", "pets", "digital", "legal", "messages"];

export function mergeVisibleSections(selected: string[] | null): Section[] {
  const userSet = new Set(selected && selected.length ? selected : SETTINGS_DEFAULT);
  const userSections = ALL_SECTIONS.filter(s => userSet.has(s.id));
  return [...userSections, ...REQUIRED_SECTIONS];
}
