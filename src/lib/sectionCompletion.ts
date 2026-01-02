/**
 * Section Completion Logic
 * 
 * SINGLE SOURCE OF TRUTH for determining if a section is "complete".
 * Uses the same data keys as buildPlanDataForPdf.ts and sectionRegistry.ts
 * 
 * A section is "complete" if it has at least one meaningful value:
 * - Non-empty string
 * - True boolean
 * - Non-empty array
 */

import { getCompletableSections, getSectionDataKey } from "./sectionRegistry";

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
 * Excludes: undefined, null, empty string, "unsure", false, empty arrays, empty objects
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

// ============= SECTION-SPECIFIC COMPLETION CHECKS =============

/**
 * Each section has its own completion check that looks at the specific
 * data locations used by that section's forms and buildPlanDataForPdf.
 */
const sectionChecks: Record<string, (pd: any) => boolean> = {
  // Pre-planning checklist - stored in localStorage under preplanning_checklist
  preplanning: (pd) => {
    // Check localStorage key used by SectionPrePlanning
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("preplanning_checklist");
      if (raw) {
        const checks = JSON.parse(raw);
        if (Object.values(checks).some((v) => v === true)) return true;
      }
    }
    // Also check plan_payload
    return hasAnyMeaningfulValue(pd.plan_payload?.preplanning) ||
           hasAnyMeaningfulValue(pd.preplanning);
  },

  // Medical & Care - stored in localStorage under healthcare_{userId}
  healthcare: (pd) => {
    const h = pd.healthcare || pd.plan_payload?.healthcare || {};
    return hasItems(h.conditions) ||
           hasItems(h.allergies) ||
           hasItems(h.medications) ||
           hasText(h.doctorPharmacy?.primaryDoctorName) ||
           hasText(h.doctorPharmacy?.pharmacyName) ||
           hasAnyMeaningfulValue(h);
  },

  // Advance Directive - stored in localStorage under advance_directive_{userId}
  advance_directive: (pd) => {
    const ad = pd.advance_directive || pd.plan_payload?.advance_directive || {};
    return hasText(ad.healthcareProxyName) ||
           hasText(ad.healthcareProxyPhone) ||
           (hasText(ad.advanceDirectiveStatus) && ad.advanceDirectiveStatus !== "unsure") ||
           (hasText(ad.dnrStatus) && ad.dnrStatus !== "unsure") ||
           (hasText(ad.polstStatus) && ad.polstStatus !== "unsure") ||
           hasText(ad.documentLocation) ||
           hasText(ad.dnrPolstLocation);
  },

  // Travel - stored in localStorage under travel_planning_{userId}
  travel: (pd) => {
    const t = pd.travel || pd.plan_payload?.travel || {};
    return hasText(t.emergencyContact) ||
           hasText(t.providerName) ||
           hasText(t.notes) ||
           (hasText(t.travelOvernight) && t.travelOvernight !== "unsure") ||
           (hasText(t.travelOutOfState) && t.travelOutOfState !== "unsure") ||
           (hasText(t.hasTravelProtection) && t.hasTravelProtection !== "unsure");
  },

  // Funeral Wishes - stored in plan_payload.funeral OR funeral_wishes_notes
  funeral: (pd) => {
    const f = pd.funeral || pd.plan_payload?.funeral || {};
    return hasText(pd.funeral_wishes_notes) ||
           hasText(f.funeralPreference) ||
           hasText(f.finalDisposition) ||
           hasText(f.disposition) ||
           hasText(f.service_type) ||
           hasText(f.notes) ||
           hasAnyMeaningfulValue(f);
  },

  // Messages - stored in messages table OR to_loved_ones_message
  messages: (pd) => {
    return hasItems(pd.messages) ||
           hasText(pd.messages_notes) ||
           hasText(pd.to_loved_ones_message) ||
           hasAnyMeaningfulValue(pd.plan_payload?.messages);
  },

  // About You / Personal - stored in personal_profiles table
  personal: (pd) => {
    const profile = pd.personal_profile || {};
    return hasText(profile.full_name) ||
           hasText(profile.preferred_name) ||
           hasText(profile.phone) ||
           hasText(profile.email) ||
           hasText(profile.address) ||
           hasText(profile.birthplace) ||
           hasAnyMeaningfulValue(pd.plan_payload?.about_you);
  },

  // Important Contacts - stored in contacts_notify / contacts_professional tables
  contacts: (pd) => {
    return hasItems(pd.contacts_notify) ||
           hasItems(pd.contacts) ||
           hasItems(pd.contacts_professional) ||
           hasAnyMeaningfulValue(pd.plan_payload?.contacts);
  },

  // Insurance - stored in insurance_policies table
  insurance: (pd) => {
    return hasItems(pd.insurance_policies) ||
           hasText(pd.insurance_notes) ||
           hasAnyMeaningfulValue(pd.plan_payload?.insurance);
  },

  // Property - stored in properties table
  property: (pd) => {
    return hasItems(pd.properties) ||
           hasText(pd.property_notes) ||
           hasAnyMeaningfulValue(pd.plan_payload?.property);
  },

  // Pets - stored in pets table
  pets: (pd) => {
    return hasItems(pd.pets) ||
           hasText(pd.pets_notes) ||
           hasAnyMeaningfulValue(pd.plan_payload?.pets);
  },

  // Digital / Online Accounts - stored in digital_notes
  digital: (pd) => {
    return hasText(pd.digital_notes) ||
           hasAnyMeaningfulValue(pd.plan_payload?.digital);
  },
};

// ============= MAIN COMPLETION FUNCTION =============

/**
 * Computes completion status for each section based on stored data.
 * Returns a map of sectionId -> boolean (true = completed)
 */
export function getSectionCompletion(planData: any): Record<string, boolean> {
  const pd = planData ?? {};
  const result: Record<string, boolean> = {};

  // Get all completable sections from registry
  const sections = getCompletableSections();

  for (const section of sections) {
    const dataKey = section.dataKey;
    const checkFn = sectionChecks[dataKey];

    if (checkFn) {
      result[section.id] = checkFn(pd);
    } else {
      // Fallback: check plan_payload and direct property
      const fromPayload = pd.plan_payload?.[dataKey];
      const fromDirect = pd[dataKey];
      result[section.id] = hasAnyMeaningfulValue(fromPayload) || hasAnyMeaningfulValue(fromDirect);
    }
  }

  return result;
}

/**
 * Check if a single section is complete
 */
export function isSectionComplete(sectionId: string, planData: any): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}
