/**
 * Section Completion Logic
 * 
 * SINGLE SOURCE OF TRUTH for determining if a section is "complete".
 * Checks plan_payload (from Supabase) AND localStorage data.
 * 
 * A section is "complete" if it has at least one meaningful value.
 */

import { getCompletableSections } from "./sectionRegistry";

export type CompletionStatus = "completed" | "not_started";

// ============= VALUE CHECKING HELPERS =============

const hasText = (v: unknown): boolean => {
  if (typeof v !== "string") return false;
  const trimmed = v.trim();
  return trimmed.length > 0 && trimmed !== "unsure";
};

const hasItems = (arr: unknown): boolean => Array.isArray(arr) && arr.length > 0;

/**
 * Recursively checks if an object has any meaningful value.
 */
const hasAnyMeaningfulValue = (obj: unknown): boolean => {
  if (obj === undefined || obj === null) return false;
  if (typeof obj === "boolean") return obj === true;
  if (typeof obj === "string") return hasText(obj);
  if (typeof obj === "number") return true;
  if (Array.isArray(obj)) return obj.length > 0;
  if (typeof obj === "object") {
    const values = Object.values(obj as Record<string, unknown>);
    return values.some((v) => hasAnyMeaningfulValue(v));
  }
  return false;
};

/**
 * Get localStorage data for a section using various possible keys
 */
function getLocalStorageData(sectionId: string, userId?: string | null): any {
  const possibleKeys = getLocalStorageKeys(sectionId, userId);
  
  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (hasAnyMeaningfulValue(parsed)) {
          return parsed;
        }
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * All possible localStorage keys for each section
 */
function getLocalStorageKeys(sectionId: string, userId?: string | null): string[] {
  const uid = userId || "";
  const keys: string[] = [];
  
  // Standard key format
  if (uid) {
    keys.push(`${sectionId}_${uid}`);
    keys.push(`section:${sectionId}:user:${uid}`);
  }
  
  // Section-specific legacy keys
  switch (sectionId) {
    case "preplanning":
      keys.push("preplanning_checklist", `preplanning_${uid}`, "preplanning_notes");
      break;
    case "healthcare":
      keys.push(`healthcare_${uid}`, "healthcare_data", `healthcare_data_${uid}`);
      break;
    case "travel":
      keys.push(`travel_planning_${uid}`, "travel_planning_data", `travel_${uid}`);
      break;
    case "advance_directive":
    case "advancedirective":
      keys.push(`advance_directive_${uid}`, "advance_directive_data", `advancedirective_${uid}`);
      break;
    case "care_preferences":
      keys.push(`care_preferences_${uid}`, "care_preferences_data");
      break;
    case "personal":
      keys.push("aboutyou_data", `personal_info_${uid}`, `plan_${uid}`);
      break;
    case "funeral":
      keys.push(`funeral_wishes_${uid}`, `plan_${uid}`);
      break;
    case "contacts":
      keys.push(`contacts_${uid}`, "contacts_data");
      break;
    case "insurance":
      keys.push(`insurance_${uid}`, "insurance_data");
      break;
    case "property":
      keys.push(`property_${uid}`, "property_data");
      break;
    case "pets":
      keys.push(`pets_${uid}`, "pets_data");
      break;
    case "digital":
      keys.push(`digital_${uid}`, "digital_data");
      break;
    case "messages":
      keys.push(`messages_${uid}`, "messages_data");
      break;
  }
  
  return keys;
}

// ============= SECTION-SPECIFIC COMPLETION CHECKS =============

const sectionChecks: Record<string, (pd: any, userId?: string | null) => boolean> = {
  // Pre-planning checklist
  preplanning: (pd, userId) => {
    // Check localStorage (primary for checklist)
    const localData = getLocalStorageData("preplanning", userId);
    if (localData && Object.values(localData).some((v) => v === true)) {
      return true;
    }
    // Also check plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.preplanning) ||
           hasAnyMeaningfulValue(pd?.preplanning);
  },

  // Medical & Care
  healthcare: (pd, userId) => {
    const localData = getLocalStorageData("healthcare", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const h = pd?.healthcare || pd?.plan_payload?.healthcare || {};
    return hasItems(h.conditions) ||
           hasItems(h.allergies) ||
           hasItems(h.medications) ||
           hasText(h.doctorPharmacy?.primaryDoctorName) ||
           hasAnyMeaningfulValue(h);
  },

  // Advance Directive
  advance_directive: (pd, userId) => {
    const localData = getLocalStorageData("advance_directive", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const ad = pd?.advance_directive || pd?.plan_payload?.advance_directive || {};
    return hasText(ad.healthcareProxyName) ||
           hasText(ad.advanceDirectiveStatus) ||
           hasText(ad.dnrStatus) ||
           hasAnyMeaningfulValue(ad);
  },

  // Travel
  travel: (pd, userId) => {
    const localData = getLocalStorageData("travel", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const t = pd?.travel || pd?.plan_payload?.travel || {};
    return hasText(t.emergencyContact) ||
           hasText(t.providerName) ||
           hasText(t.notes) ||
           hasAnyMeaningfulValue(t);
  },

  // Funeral Wishes - check DB tables + localStorage + plan_payload
  funeral: (pd, userId) => {
    // DB-stored funeral_wishes_notes
    if (hasText(pd?.funeral_wishes_notes)) return true;
    
    // Check localStorage
    const localData = getLocalStorageData("funeral", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    // Check plan_payload.funeral
    const f = pd?.funeral || pd?.plan_payload?.funeral || {};
    return hasText(f.funeralPreference) ||
           hasText(f.finalDisposition) ||
           hasText(f.serviceType) ||
           hasText(f.burialChoice) ||
           hasAnyMeaningfulValue(f);
  },

  // Messages
  messages: (pd, userId) => {
    // DB arrays
    if (hasItems(pd?.messages)) return true;
    // DB notes
    if (hasText(pd?.messages_notes)) return true;
    if (hasText(pd?.to_loved_ones_message)) return true;
    // localStorage
    const localData = getLocalStorageData("messages", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.messages);
  },

  // About You / Personal - check DB personal_profiles table
  personal: (pd, userId) => {
    // DB personal_profile
    const profile = pd?.personal_profile || {};
    if (hasText(profile.full_name) ||
        hasText(profile.preferred_name) ||
        hasText(profile.address) ||
        hasText(profile.birthplace)) {
      return true;
    }
    // DB about_me_notes
    if (hasText(pd?.about_me_notes)) return true;
    // localStorage
    const localData = getLocalStorageData("personal", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.about_you) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.personal);
  },

  // Important Contacts - check DB tables
  contacts: (pd, userId) => {
    // DB tables
    if (hasItems(pd?.contacts_notify)) return true;
    if (hasItems(pd?.contacts)) return true;
    if (hasItems(pd?.contacts_professional)) return true;
    // localStorage
    const localData = getLocalStorageData("contacts", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.contacts);
  },

  // Insurance - check DB insurance_policies table
  insurance: (pd, userId) => {
    // DB table
    if (hasItems(pd?.insurance_policies)) return true;
    // DB notes
    if (hasText(pd?.insurance_notes)) return true;
    // localStorage
    const localData = getLocalStorageData("insurance", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.insurance);
  },

  // Property - check DB properties table
  property: (pd, userId) => {
    // DB table
    if (hasItems(pd?.properties)) return true;
    // DB notes
    if (hasText(pd?.property_notes)) return true;
    // localStorage
    const localData = getLocalStorageData("property", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.property);
  },

  // Pets - check DB pets table
  pets: (pd, userId) => {
    // DB table
    if (hasItems(pd?.pets)) return true;
    // DB notes
    if (hasText(pd?.pets_notes)) return true;
    // localStorage
    const localData = getLocalStorageData("pets", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.pets);
  },

  // Digital / Online Accounts
  digital: (pd, userId) => {
    // DB notes
    if (hasText(pd?.digital_notes)) return true;
    // localStorage
    const localData = getLocalStorageData("digital", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    // plan_payload
    return hasAnyMeaningfulValue(pd?.plan_payload?.digital);
  },
};

// ============= MAIN COMPLETION FUNCTION =============

/**
 * Computes completion status for each section based on stored data.
 * Returns a map of sectionId -> boolean (true = completed)
 * 
 * @param planData - Data from buildPlanDataForPdf (Supabase + localStorage merged)
 * @param userId - User ID for localStorage key lookup (optional)
 */
export function getSectionCompletion(planData: any, userId?: string | null): Record<string, boolean> {
  const pd = planData ?? {};
  const result: Record<string, boolean> = {};

  const sections = getCompletableSections();

  for (const section of sections) {
    const dataKey = section.dataKey;
    const checkFn = sectionChecks[dataKey];

    if (checkFn) {
      result[section.id] = checkFn(pd, userId);
    } else {
      // Fallback: check plan_payload and direct property and localStorage
      const fromPayload = pd?.plan_payload?.[dataKey];
      const fromDirect = pd?.[dataKey];
      const fromLocal = getLocalStorageData(dataKey, userId);
      result[section.id] = hasAnyMeaningfulValue(fromPayload) || 
                          hasAnyMeaningfulValue(fromDirect) ||
                          hasAnyMeaningfulValue(fromLocal);
    }
  }

  // Debug logging
  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] Results:", result);
    console.log("[sectionCompletion] planData keys:", Object.keys(pd));
    console.log("[sectionCompletion] plan_payload keys:", Object.keys(pd?.plan_payload || {}));
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
