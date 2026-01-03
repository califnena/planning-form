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

const completionChecks: Record<string, (data: Record<string, any>) => boolean> = {
  personal: (data) => hasMeaningfulData(data.personal) || hasMeaningfulData(data.about_you),
  contacts: (data) => hasMeaningfulData(data.contacts),

  // Medical & Care should consider healthcare + care prefs + (if present) advance directive status
  healthcare: (data) =>
    hasMeaningfulData(data.healthcare) ||
    hasMeaningfulData(data.care_preferences) ||
    hasMeaningfulData(data.advance_directive),

  funeral: (data) => hasMeaningfulData(data.funeral),
  financial: (data) => hasMeaningfulData(data.financial),
  insurance: (data) => hasMeaningfulData(data.insurance),
  property: (data) => hasMeaningfulData(data.property),
  pets: (data) => hasMeaningfulData(data.pets),
  messages: (data) => hasMeaningfulData(data.messages),
  digital: (data) => hasMeaningfulData(data.digital),

  preplanning: (data) => hasMeaningfulData(data.preplanning),
  travel: (data) => hasMeaningfulData(data.travel),
  legal: (data) => hasMeaningfulData(data.legal),
  advance_directive: (data) => hasMeaningfulData(data.advance_directive),
  care_preferences: (data) => hasMeaningfulData(data.care_preferences),
  healthcare_proxy: (data) => hasMeaningfulData(data.contacts), // fallback
};

export function getSectionCompletion(planData: any): Record<string, boolean> {
  const normalized = normalizePlanData(planData);
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

export function isSectionComplete(sectionId: string, planData: any): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}
