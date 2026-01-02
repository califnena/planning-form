/**
 * Section Completion Logic
 * 
 * SINGLE SOURCE OF TRUTH for determining if a section is "complete".
 * Checks both Supabase data AND localStorage data.
 * 
 * A section is "complete" if it has at least one meaningful value.
 */

import { getCompletableSections } from "./sectionRegistry";
import { getStorageWithMigration, getIdentitySync } from "./identityUtils";

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
 * Get localStorage data for a section using identity-based keys
 */
function getLocalStorageData(sectionId: string, userId?: string | null): any {
  const identity = getIdentitySync(userId);
  
  // Try standardized key first
  const standardData = getStorageWithMigration(sectionId, identity);
  if (standardData && hasAnyMeaningfulValue(standardData)) {
    return standardData;
  }
  
  // Also check legacy keys directly (for backward compatibility)
  const legacyKeys = getLegacyKeys(sectionId, userId);
  for (const key of legacyKeys) {
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
 * Legacy keys to check for each section
 */
function getLegacyKeys(sectionId: string, userId?: string | null): string[] {
  const uid = userId || "";
  switch (sectionId) {
    case "preplanning":
      return ["preplanning_checklist", `preplanning_${uid}`, "preplanning_notes"];
    case "healthcare":
      return [`healthcare_${uid}`, "healthcare_data"];
    case "travel":
      return [`travel_planning_${uid}`, "travel_planning_data", `travel_${uid}`];
    case "advance_directive":
      return [`advance_directive_${uid}`, "advance_directive_data"];
    case "care_preferences":
      return [`care_preferences_${uid}`, "care_preferences_data"];
    case "personal":
      return [`aboutyou_data`, `personal_info_${uid}`, `plan_${uid}`];
    case "funeral":
      return [`funeral_wishes_${uid}`, `plan_${uid}`];
    default:
      return [];
  }
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
           hasText(ad.dnrStatus);
  },

  // Travel
  travel: (pd, userId) => {
    const localData = getLocalStorageData("travel", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const t = pd?.travel || pd?.plan_payload?.travel || {};
    return hasText(t.emergencyContact) ||
           hasText(t.providerName) ||
           hasText(t.notes);
  },

  // Funeral Wishes
  funeral: (pd, userId) => {
    const localData = getLocalStorageData("funeral", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const f = pd?.funeral || pd?.plan_payload?.funeral || {};
    return hasText(pd?.funeral_wishes_notes) ||
           hasText(f.funeralPreference) ||
           hasText(f.finalDisposition) ||
           hasAnyMeaningfulValue(f);
  },

  // Messages
  messages: (pd) => {
    return hasItems(pd?.messages) ||
           hasText(pd?.messages_notes) ||
           hasText(pd?.to_loved_ones_message) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.messages);
  },

  // About You / Personal
  personal: (pd, userId) => {
    const localData = getLocalStorageData("personal", userId);
    if (hasAnyMeaningfulValue(localData)) return true;
    
    const profile = pd?.personal_profile || {};
    return hasText(profile.full_name) ||
           hasText(profile.preferred_name) ||
           hasText(profile.address) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.about_you);
  },

  // Important Contacts
  contacts: (pd) => {
    return hasItems(pd?.contacts_notify) ||
           hasItems(pd?.contacts) ||
           hasItems(pd?.contacts_professional) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.contacts);
  },

  // Insurance
  insurance: (pd) => {
    return hasItems(pd?.insurance_policies) ||
           hasText(pd?.insurance_notes) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.insurance);
  },

  // Property
  property: (pd) => {
    return hasItems(pd?.properties) ||
           hasText(pd?.property_notes) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.property);
  },

  // Pets
  pets: (pd) => {
    return hasItems(pd?.pets) ||
           hasText(pd?.pets_notes) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.pets);
  },

  // Digital / Online Accounts
  digital: (pd) => {
    return hasText(pd?.digital_notes) ||
           hasAnyMeaningfulValue(pd?.plan_payload?.digital);
  },
};

// ============= MAIN COMPLETION FUNCTION =============

/**
 * Computes completion status for each section based on stored data.
 * Returns a map of sectionId -> boolean (true = completed)
 * 
 * @param planData - Data from Supabase (optional)
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
      // Fallback: check plan_payload and direct property
      const fromPayload = pd?.plan_payload?.[dataKey];
      const fromDirect = pd?.[dataKey];
      const fromLocal = getLocalStorageData(dataKey, userId);
      result[section.id] = hasAnyMeaningfulValue(fromPayload) || 
                          hasAnyMeaningfulValue(fromDirect) ||
                          hasAnyMeaningfulValue(fromLocal);
    }
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
