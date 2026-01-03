/**
 * getSectionData.ts
 * 
 * Focused reader helper for Plan Summary + PDF data feed.
 * Per mandate: Only reads data, no writes, no localStorage, no restructuring.
 * 
 * DOCUMENTED STORAGE PATHS (from codebase analysis):
 * 
 * Section             | Writes to plan_payload via
 * --------------------|--------------------------------------------
 * About You           | personal, about_you, about
 * Family              | personal.family, personal.partner_name, personal.child_names
 * My Life Story       | legacy, life_story
 * Financial Life      | financial (obj with has_*, accounts array)
 * Online Accounts     | digital (obj with has_*, accounts array, phones array)
 * Pets                | pets (array of {id, type, name, instructions})
 * Messages            | messages (array of {recipients, text_message})
 * Property            | property (obj with has_*, items array)
 * Medical & Care      | healthcare (obj with conditions[], allergies[], medications[], doctorPharmacy)
 * Advance Directive   | advance_directive
 * Funeral Wishes      | funeral, wishes
 * Insurance           | insurance (obj with has_*, policies)
 * Travel              | travel
 * Important Contacts  | contacts (obj with contacts[], importantPeople[]) OR contacts_notify (array)
 * 
 * Data flow: Section components call onChange({...data, <section>: {...}})
 * usePlanData separates table columns from section data and stores section data in plan_payload.
 * buildPlanDataForPdf normalizes plan_payload and spreads it to top-level keys.
 */

// ============= TYPES =============

type SectionKey = 
  | "personal" | "about_you" | "about"
  | "legacy" | "life_story"
  | "contacts"
  | "healthcare" | "medical"
  | "advancedirective" | "advance_directive"
  | "funeral" | "wishes"
  | "financial"
  | "insurance"
  | "property"
  | "pets"
  | "digital"
  | "messages"
  | "travel"
  | "notes";

// ============= HELPERS =============

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/**
 * Check if a value has meaningful data.
 * - string: non-whitespace content
 * - array: at least one item with any non-empty field
 * - object: any nested non-empty field
 * - boolean true: counts ONLY for explicit user choice fields
 */
export function hasMeaningfulData(value: unknown): boolean {
  if (value === undefined || value === null) return false;

  // Boolean true counts only when it represents explicit opt-in
  if (typeof value === "boolean") return value === true;

  if (typeof value === "number") return !Number.isNaN(value);

  if (typeof value === "string") return value.trim().length > 0;

  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    return value.some((v) => hasMeaningfulData(v));
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.values(obj).some((v) => hasMeaningfulData(v));
  }

  return false;
}

// ============= SECTION DATA PATHS =============

/**
 * Maps section keys to their possible storage paths in plan_payload.
 * Returns first non-empty match.
 */
const SECTION_PATHS: Record<string, (payload: Record<string, unknown>) => unknown> = {
  // About You / Personal
  personal: (p) => p.personal || p.about_you || p.about || {},
  about_you: (p) => p.personal || p.about_you || p.about || {},
  about: (p) => p.personal || p.about_you || p.about || {},

  // Life Story / Legacy
  legacy: (p) => p.legacy || p.life_story || p.lifeStory || {},
  life_story: (p) => p.legacy || p.life_story || p.lifeStory || {},

  // Contacts
  contacts: (p) => {
    const contactsObj = asObject(p.contacts);
    const arr = asArray(contactsObj.contacts);
    const important = asArray(contactsObj.importantPeople);
    const notify = asArray(p.contacts_notify);
    const merged = [...arr, ...important, ...notify].filter(Boolean);
    return merged.length > 0 ? merged : contactsObj;
  },

  // Healthcare / Medical
  healthcare: (p) => p.healthcare || p.health_care || p.medical || {},
  medical: (p) => p.healthcare || p.health_care || p.medical || {},

  // Advance Directive
  advancedirective: (p) => p.advance_directive || p.advanceDirective || {},
  advance_directive: (p) => p.advance_directive || p.advanceDirective || {},

  // Funeral / Wishes
  funeral: (p) => p.funeral || p.funeral_wishes || p.wishes || {},
  wishes: (p) => p.funeral || p.funeral_wishes || p.wishes || {},

  // Financial
  financial: (p) => p.financial || p.financial_life || {},

  // Insurance
  insurance: (p) => p.insurance || p.insurance_policies || {},

  // Property
  property: (p) => p.property || p.property_valuables || p.properties || {},

  // Pets
  pets: (p) => asArray(p.pets),

  // Digital / Online Accounts
  digital: (p) => p.digital || p.digital_accounts || p.digital_assets || {},

  // Messages
  messages: (p) => asArray(p.messages),

  // Travel
  travel: (p) => p.travel || p.travel_planning || {},

  // Notes
  notes: (p) => p.notes || p.instructions || {},
};

// ============= MAIN FUNCTIONS =============

/**
 * Get section data from plan_payload by checking real storage paths.
 * Returns first non-empty match, does not merge or restructure.
 * 
 * @param planPayload - The raw plan_payload object from DB or merged planData
 * @param sectionKey - The section identifier (e.g., 'financial', 'digital', 'pets')
 * @returns The section data or empty object/array
 */
export function getSectionData(planPayload: unknown, sectionKey: string): unknown {
  const payload = asObject(planPayload);
  
  // Normalize key
  const normalizedKey = sectionKey.toLowerCase().replace(/-/g, "_");
  
  const getter = SECTION_PATHS[normalizedKey];
  if (getter) {
    return getter(payload);
  }
  
  // Fallback: try direct access
  return payload[normalizedKey] || payload[sectionKey] || {};
}

/**
 * Check if a section has meaningful data.
 * Convenience wrapper around getSectionData + hasMeaningfulData.
 */
export function hasSectionData(planPayload: unknown, sectionKey: string): boolean {
  const data = getSectionData(planPayload, sectionKey);
  return hasMeaningfulData(data);
}

/**
 * Get all section data in a standardized shape.
 * Used by PDF builder and completion detection.
 */
export function getAllSectionData(planPayload: unknown): Record<string, unknown> {
  const keys = [
    "personal", "legacy", "contacts", "healthcare", "advancedirective",
    "funeral", "financial", "insurance", "property", "pets", 
    "digital", "messages", "travel", "notes"
  ];
  
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    result[key] = getSectionData(planPayload, key);
  }
  return result;
}

/**
 * DEV helper: Log which sections have data vs show as empty.
 */
export function logSectionDataStatus(planPayload: unknown, context: string): void {
  if (!import.meta.env.DEV) return;
  
  const allData = getAllSectionData(planPayload);
  const hasData: string[] = [];
  const noData: string[] = [];
  
  for (const [key, value] of Object.entries(allData)) {
    if (hasMeaningfulData(value)) {
      hasData.push(key);
    } else {
      noData.push(key);
    }
  }
  
  console.log(`[${context}] Sections with data:`, hasData);
  console.log(`[${context}] Sections without data:`, noData);
}
