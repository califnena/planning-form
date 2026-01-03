/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * Hard rule: completion is computed ONLY from DB-backed plan_payload data
 * (via normalizePlanData()), not localStorage and not legacy table columns.
 */

import { getCompletableSections } from "./sectionRegistry";
import { normalizePlanData } from "./normalizePlanData";

// ============= VALUE CHECKING HELPERS =============

/**
 * Recursively checks if a value is "meaningful".
 * - strings: trimmed length > 0 (and not placeholder-ish)
 * - numbers: not NaN
 * - booleans: true is meaningful
 * - arrays: any meaningful item
 * - objects: any meaningful value
 */
export function hasMeaningfulData(value: unknown): boolean {
  if (value === undefined || value === null) return false;

  if (typeof value === "boolean") return value === true;

  if (typeof value === "number") return !Number.isNaN(value);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const lowered = trimmed.toLowerCase();
    const placeholders = new Set(["unsure", "not sure", "not specified", "n/a", "none"]);
    return !placeholders.has(lowered);
  }

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

// ============= SECTION COMPLETION =============

/**
 * Check if contacts section has meaningful data.
 * Handles both array format and object-with-arrays format.
 */
function hasContactData(contacts: any): boolean {
  if (!contacts) return false;
  
  // If it's an array directly
  if (Array.isArray(contacts)) {
    return contacts.some(c => c && (c.name || c.phone || c.email));
  }
  
  // If it's an object with contacts/importantPeople arrays
  if (typeof contacts === "object") {
    const arr = contacts.contacts || contacts.importantPeople || [];
    if (Array.isArray(arr) && arr.some((c: any) => c && (c.name || c.phone || c.email))) {
      return true;
    }
    // Also check for any other meaningful fields
    return hasMeaningfulData(contacts);
  }
  
  return false;
}

/**
 * Check if healthcare/medical section has meaningful data.
 * Checks all sub-sections: medications, conditions, allergies, doctor/pharmacy, care prefs.
 */
function hasHealthcareData(data: Record<string, any>): boolean {
  const hc = data.healthcare || {};
  const care = data.care_preferences || {};
  const ad = data.advance_directive || {};
  
  // Check medications array
  if (Array.isArray(hc.medications) && hc.medications.length > 0) return true;
  
  // Check conditions
  if (hc.conditions && typeof hc.conditions === "string" && hc.conditions.trim()) return true;
  if (Array.isArray(hc.conditions) && hc.conditions.length > 0) return true;
  
  // Check allergies
  if (hc.allergies && typeof hc.allergies === "string" && hc.allergies.trim()) return true;
  if (Array.isArray(hc.allergies) && hc.allergies.length > 0) return true;
  
  // Check doctor/pharmacy
  if (hc.primaryDoctor || hc.pharmacy || hc.doctorPhone || hc.pharmacyPhone) return true;
  
  // Check care preferences (checkboxes)
  if (care && typeof care === "object") {
    const careValues = Object.values(care);
    if (careValues.some(v => v === true)) return true;
  }
  
  // Check advance directive status
  if (ad.advanceDirectiveStatus && ad.advanceDirectiveStatus !== "unsure") return true;
  if (ad.dnrStatus && ad.dnrStatus !== "unsure") return true;
  if (ad.polstStatus && ad.polstStatus !== "unsure") return true;
  if (ad.healthcareProxyName) return true;
  
  // General fallback
  return hasMeaningfulData(hc) || hasMeaningfulData(care);
}

const completionChecks: Record<string, (data: Record<string, any>) => boolean> = {
  personal: (data) => hasMeaningfulData(data.personal) || hasMeaningfulData(data.about_you),
  contacts: (data) => hasContactData(data.contacts),

  // Medical & Care should consider healthcare + care prefs + advance directive status
  healthcare: (data) => hasHealthcareData(data),

  funeral: (data) => hasMeaningfulData(data.funeral),
  
  financial: (data) => {
    const fin = data.financial || {};
    // Check for any checkboxes being true
    if (fin.has_checking || fin.has_savings || fin.has_retirement || 
        fin.has_investment || fin.has_crypto || fin.has_safe_deposit || 
        fin.has_business || fin.has_debts) return true;
    // Check for any accounts array
    if (Array.isArray(fin.accounts) && fin.accounts.length > 0) return true;
    if (Array.isArray(fin.bankAccounts) && fin.bankAccounts.length > 0) return true;
    if (Array.isArray(fin.investments) && fin.investments.length > 0) return true;
    if (fin.notes && fin.notes.trim()) return true;
    if (fin.safe_deposit_details || fin.crypto_details || fin.business_details || fin.debts_details) return true;
    return hasMeaningfulData(fin);
  },
  
  insurance: (data) => {
    const ins = data.insurance || {};
    if (Array.isArray(ins.policies) && ins.policies.length > 0) return true;
    if (ins.cardLocation && ins.cardLocation.trim()) return true;
    if (ins.notes && ins.notes.trim()) return true;
    return hasMeaningfulData(ins);
  },
  
  property: (data) => {
    const prop = data.property || {};
    if (Array.isArray(prop.properties) && prop.properties.length > 0) return true;
    if (Array.isArray(prop.valuables) && prop.valuables.length > 0) return true;
    if (prop.notes && prop.notes.trim()) return true;
    return hasMeaningfulData(prop);
  },
  
  pets: (data) => {
    const pets = data.pets;
    if (Array.isArray(pets) && pets.length > 0) {
      return pets.some(p => p && (p.name || p.caregiver || p.notes));
    }
    return false;
  },
  
  messages: (data) => {
    const msgs = data.messages;
    if (Array.isArray(msgs) && msgs.length > 0) {
      return msgs.some(m => m && (m.body || m.title || m.message || m.text));
    }
    return false;
  },
  
  digital: (data) => {
    const dig = data.digital || {};
    // Check for accounts array (common structure)
    if (Array.isArray(dig.accounts) && dig.accounts.length > 0) return true;
    // Check for socialAccounts array
    if (Array.isArray(dig.socialAccounts) && dig.socialAccounts.length > 0) return true;
    // Check notes
    if (dig.notes && String(dig.notes).trim()) return true;
    // Check passwordManager or deviceAccess
    if (dig.passwordManager || dig.deviceAccess) return true;
    return hasMeaningfulData(dig);
  },
  
  travel: (data) => {
    const travel = data.travel || {};
    return hasMeaningfulData(travel);
  },

  preplanning: (data) => hasMeaningfulData(data.preplanning),
  legal: (data) => hasMeaningfulData(data.legal),
  advance_directive: (data) => {
    const ad = data.advance_directive || {};
    if (ad.advanceDirectiveStatus && ad.advanceDirectiveStatus !== "unsure") return true;
    if (ad.dnrStatus && ad.dnrStatus !== "unsure") return true;
    if (ad.healthcareProxyName) return true;
    return hasMeaningfulData(ad);
  },
  // Alias for registry id "advancedirective" (no underscore)
  advancedirective: (data) => {
    const ad = data.advance_directive || {};
    if (ad.advanceDirectiveStatus && ad.advanceDirectiveStatus !== "unsure") return true;
    if (ad.dnrStatus && ad.dnrStatus !== "unsure") return true;
    if (ad.healthcareProxyName) return true;
    return hasMeaningfulData(ad);
  },
  care_preferences: (data) => hasMeaningfulData(data.care_preferences),
  healthcare_proxy: (data) => hasContactData(data.contacts),
};

export function getSectionCompletion(planData: any, userId?: string): Record<string, boolean> {
  const normalized = normalizePlanData(planData, userId);
  const data = normalized.data;

  const result: Record<string, boolean> = {};
  const sections = getCompletableSections();

  for (const section of sections) {
    const key = section.dataKey;
    const check = completionChecks[key];
    result[section.id] = check ? check(data) : hasMeaningfulData(data[key]);
  }

  if (import.meta.env.DEV) {
    // Diagnostic logging (remove once verified)
    // eslint-disable-next-line no-console
    console.log("[sectionCompletion] normalized.data keys:", Object.keys(data));
    // eslint-disable-next-line no-console
    console.log("[sectionCompletion] completion map:", result);
  }

  return result;
}

export function isSectionComplete(sectionId: string, planData: any, userId?: string): boolean {
  const completion = getSectionCompletion(planData, userId);
  return completion[sectionId] || false;
}
