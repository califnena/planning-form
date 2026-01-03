/**
 * Section Completion Logic
 * 
 * SINGLE SOURCE OF TRUTH for determining if a section is "complete".
 * Reads from plan_payload (Supabase) as the primary storage.
 * 
 * A section is "complete" if it has at least one meaningful value.
 */

import { getCompletableSections } from "./sectionRegistry";

export type CompletionStatus = "completed" | "not_started";

// ============= VALUE CHECKING HELPERS =============

/**
 * Recursively checks if a value is "meaningful" (not empty/null/undefined).
 * - strings: trimmed length > 0 and not placeholder values
 * - booleans: true counts as meaningful
 * - numbers: any number (including 0) is meaningful
 * - arrays: length > 0 OR any item is meaningful
 * - objects: any key has a meaningful value
 */
export function hasMeaningfulData(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  
  if (typeof value === "boolean") {
    // A checked checkbox counts as meaningful
    return value === true;
  }
  
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    // Skip placeholder/default values
    const placeholders = ["unsure", "not specified", "n/a", "none", ""];
    return trimmed.length > 0 && !placeholders.includes(trimmed);
  }
  
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  
  if (Array.isArray(value)) {
    // Array with items, or any item is meaningful
    if (value.length === 0) return false;
    return value.some((item) => hasMeaningfulData(item));
  }
  
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Check if any property is meaningful
    return Object.values(obj).some((v) => hasMeaningfulData(v));
  }
  
  return false;
}

// ============= SECTION-SPECIFIC COMPLETION CHECKS =============

/**
 * Section-specific check functions.
 * Each function receives the full planData and checks all relevant paths.
 */
/**
 * Helper to get section data from planData.
 * Checks multiple possible locations: direct property, plan_payload, and nested structures.
 */
function getSectionData(pd: any, key: string): any {
  // Direct property (merged from plan_payload)
  if (pd?.[key] !== undefined) return pd[key];
  // From plan_payload
  if (pd?.plan_payload?.[key] !== undefined) return pd.plan_payload[key];
  return undefined;
}

const sectionChecks: Record<string, (pd: any) => boolean> = {
  // Pre-planning checklist - check for any checked item
  preplanning: (pd) => {
    const pp = getSectionData(pd, 'preplanning') || {};
    // Check if any checkbox is true
    return Object.values(pp).some((v) => v === true || hasMeaningfulData(v));
  },

  // About You / Personal
  personal: (pd) => {
    // Check personal_profile from DB
    const profile = pd?.personal_profile || {};
    if (hasMeaningfulData(profile.full_name) ||
        hasMeaningfulData(profile.preferred_name) ||
        hasMeaningfulData(profile.address) ||
        hasMeaningfulData(profile.birthplace) ||
        hasMeaningfulData(profile.phone) ||
        hasMeaningfulData(profile.email) ||
        hasMeaningfulData(profile.religion) ||
        hasMeaningfulData(profile.hobbies)) {
      return true;
    }
    // Check about_you or personal in plan data
    const aboutYou = getSectionData(pd, 'about_you') || getSectionData(pd, 'personal') || {};
    if (hasMeaningfulData(aboutYou)) return true;
    // Check notes
    if (hasMeaningfulData(pd?.about_me_notes)) return true;
    return false;
  },

  // Medical & Care Preferences
  healthcare: (pd) => {
    const h = getSectionData(pd, 'healthcare') || {};
    if (hasMeaningfulData(h)) return true;
    // Also check care_preferences sub-object
    const cp = getSectionData(pd, 'care_preferences') || {};
    if (hasMeaningfulData(cp)) return true;
    return false;
  },

  // Advance Directive
  advance_directive: (pd) => {
    const ad = getSectionData(pd, 'advance_directive') || {};
    return hasMeaningfulData(ad);
  },

  // Funeral Wishes
  funeral: (pd) => {
    // Check funeral notes from DB
    if (hasMeaningfulData(pd?.funeral_wishes_notes)) return true;
    // Check funeral data (direct or from payload)
    const f = getSectionData(pd, 'funeral') || {};
    if (hasMeaningfulData(f)) return true;
    // Check funeral_funding array
    if (Array.isArray(pd?.funeral_funding) && pd.funeral_funding.length > 0) return true;
    return false;
  },

  // Insurance
  insurance: (pd) => {
    // Check insurance_policies array from DB
    if (Array.isArray(pd?.insurance_policies) && pd.insurance_policies.length > 0) return true;
    // Check notes
    if (hasMeaningfulData(pd?.insurance_notes)) return true;
    // Check insurance data
    const ins = getSectionData(pd, 'insurance') || {};
    if (hasMeaningfulData(ins)) return true;
    return false;
  },

  // Important Contacts
  contacts: (pd) => {
    // Check contacts_notify array from DB
    if (Array.isArray(pd?.contacts_notify) && pd.contacts_notify.length > 0) return true;
    // Check contacts array
    if (Array.isArray(pd?.contacts) && pd.contacts.length > 0) return true;
    // Check contacts_professional array
    if (Array.isArray(pd?.contacts_professional) && pd.contacts_professional.length > 0) return true;
    // Check contacts data
    const c = getSectionData(pd, 'contacts') || {};
    if (hasMeaningfulData(c)) return true;
    return false;
  },

  // Property & Valuables
  property: (pd) => {
    // Check properties array from DB
    if (Array.isArray(pd?.properties) && pd.properties.length > 0) return true;
    // Check notes
    if (hasMeaningfulData(pd?.property_notes)) return true;
    // Check property data - this is what sections actually save to
    const prop = getSectionData(pd, 'property') || {};
    if (hasMeaningfulData(prop)) return true;
    // Check for property items array inside property object
    if (Array.isArray(prop.items) && prop.items.length > 0) return true;
    // Check for has_* checkboxes in property
    const hasAnyChecked = Object.entries(prop).some(([k, v]) => k.startsWith('has_') && v === true);
    if (hasAnyChecked) return true;
    return false;
  },

  // Pets
  pets: (pd) => {
    // Check pets array from DB (separate table)
    if (Array.isArray(pd?.pets) && pd.pets.length > 0) {
      // Check if any pet has meaningful data
      return pd.pets.some((pet: any) => hasMeaningfulData(pet.name) || hasMeaningfulData(pet.type));
    }
    // Check notes
    if (hasMeaningfulData(pd?.pets_notes)) return true;
    // Check pets data from plan_payload (sections save here as array)
    const petsPayload = getSectionData(pd, 'pets');
    if (Array.isArray(petsPayload) && petsPayload.length > 0) {
      return petsPayload.some((pet: any) => hasMeaningfulData(pet.name) || hasMeaningfulData(pet.type));
    }
    if (hasMeaningfulData(petsPayload)) return true;
    return false;
  },

  // Messages to Loved Ones
  messages: (pd) => {
    // Check messages array from DB (separate table)
    if (Array.isArray(pd?.messages) && pd.messages.length > 0) {
      return pd.messages.some((msg: any) => hasMeaningfulData(msg.recipients) || hasMeaningfulData(msg.text_message));
    }
    // Check notes
    if (hasMeaningfulData(pd?.messages_notes)) return true;
    if (hasMeaningfulData(pd?.to_loved_ones_message)) return true;
    // Check messages data from plan_payload (sections save here as array)
    const msgPayload = getSectionData(pd, 'messages');
    if (Array.isArray(msgPayload) && msgPayload.length > 0) {
      return msgPayload.some((msg: any) => hasMeaningfulData(msg.recipients) || hasMeaningfulData(msg.text_message));
    }
    if (hasMeaningfulData(msgPayload)) return true;
    return false;
  },

  // Travel & Away-From-Home
  travel: (pd) => {
    const t = getSectionData(pd, 'travel') || {};
    return hasMeaningfulData(t);
  },

  // Online Accounts (Digital)
  digital: (pd) => {
    // Check notes
    if (hasMeaningfulData(pd?.digital_notes)) return true;
    // Check digital data from plan_payload
    const d = getSectionData(pd, 'digital') || {};
    if (hasMeaningfulData(d)) return true;
    // Check for accounts or phones arrays
    if (Array.isArray(d.accounts) && d.accounts.length > 0) return true;
    if (Array.isArray(d.phones) && d.phones.length > 0) return true;
    // Check for has_* checkboxes
    const hasAnyChecked = Object.entries(d).some(([k, v]) => k.startsWith('has_') && v === true);
    if (hasAnyChecked) return true;
    return false;
  },

  // Financial Life
  financial: (pd) => {
    // Check related DB arrays
    if (Array.isArray(pd?.investments) && pd.investments.length > 0) return true;
    if (Array.isArray(pd?.debts) && pd.debts.length > 0) return true;
    if (Array.isArray(pd?.bank_accounts) && pd.bank_accounts.length > 0) return true;
    if (Array.isArray(pd?.businesses) && pd.businesses.length > 0) return true;
    // Check notes
    if (hasMeaningfulData(pd?.financial_notes)) return true;
    // Check financial data from plan_payload
    const f = getSectionData(pd, 'financial') || {};
    if (hasMeaningfulData(f)) return true;
    // Check for accounts array
    if (Array.isArray(f.accounts) && f.accounts.length > 0) return true;
    // Check for has_* checkboxes (checking, savings, retirement, etc.)
    const hasAnyChecked = Object.entries(f).some(([k, v]) => k.startsWith('has_') && v === true);
    if (hasAnyChecked) return true;
    return false;
  },

  // Legal documents
  legal: (pd) => {
    if (hasMeaningfulData(pd?.legal_notes)) return true;
    const l = getSectionData(pd, 'legal') || {};
    if (hasMeaningfulData(l)) return true;
    return false;
  },
};

// ============= MAIN COMPLETION FUNCTION =============

/**
 * Computes completion status for each section based on stored plan data.
 * Returns a map of sectionId -> boolean (true = completed)
 * 
 * @param planData - Data from buildPlanDataForPdf (Supabase merged data)
 * @param userId - Optional user ID (unused in new logic, kept for compatibility)
 */
export function getSectionCompletion(planData: any, userId?: string | null): Record<string, boolean> {
  const pd = planData ?? {};
  const result: Record<string, boolean> = {};

  const sections = getCompletableSections();

  // Debug logging in dev mode
  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] Checking planData:", {
      keys: Object.keys(pd),
      plan_payload_keys: Object.keys(pd?.plan_payload || {}),
      personal_profile: pd?.personal_profile,
      pets_count: pd?.pets?.length,
      messages_count: pd?.messages?.length,
      properties_count: pd?.properties?.length,
      insurance_policies_count: pd?.insurance_policies?.length,
    });
  }

  for (const section of sections) {
    const dataKey = section.dataKey;
    const checkFn = sectionChecks[dataKey];

    if (checkFn) {
      result[section.id] = checkFn(pd);
    } else {
      // Fallback: check plan_payload[dataKey] and direct property
      const fromPayload = pd?.plan_payload?.[dataKey];
      const fromDirect = pd?.[dataKey];
      result[section.id] = hasMeaningfulData(fromPayload) || hasMeaningfulData(fromDirect);
    }
  }

  // Debug logging
  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] Results:", result);
  }

  return result;
}

/**
 * Check if a single section is complete
 */
export function isSectionComplete(sectionId: string, planData: any, userId?: string | null): boolean {
  const completion = getSectionCompletion(planData, userId);
  return completion[sectionId] || false;
}
