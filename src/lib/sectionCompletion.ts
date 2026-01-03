/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * Hard rule (per mandate): completion is computed ONLY from normalized `plan_payload`
 * via normalizePlanPayload(). No localStorage reads.
 */

import { getCompletableSections } from "./sectionRegistry";
import { hasMeaningfulData, normalizePlanPayload } from "./normalizePlanPayload";

// ============= SECTION COMPLETION =============

function hasContactData(contacts: any[]): boolean {
  if (!Array.isArray(contacts) || contacts.length === 0) return false;
  return contacts.some((c) => c && (c.name || c.phone || c.email || c.relationship));
}

const completionChecks: Record<string, (n: ReturnType<typeof normalizePlanPayload>) => boolean> = {
  // Registry ids
  personal: (n) => hasMeaningfulData(n.about),
  legacy: (n) => hasMeaningfulData(n.legacy),
  contacts: (n) => hasContactData(n.contacts) || hasMeaningfulData(n.contacts),
  healthcare: (n) => hasMeaningfulData(n.medical),
  advancedirective: (n) => hasMeaningfulData(n.advance_directive),
  funeral: (n) => hasMeaningfulData(n.wishes),
  financial: (n) => hasMeaningfulData(n.financial),
  insurance: (n) => hasMeaningfulData(n.insurance),
  property: (n) => hasMeaningfulData(n.property),
  pets: (n) => hasMeaningfulData(n.pets),
  messages: (n) => hasMeaningfulData(n.messages),
  digital: (n) => hasMeaningfulData(n.digital),
  travel: (n) => hasMeaningfulData(n.travel),
};

export function getSectionCompletion(planData: any): Record<string, boolean> {
  const normalized = normalizePlanPayload(planData?.plan_payload);

  const result: Record<string, boolean> = {};
  const sections = getCompletableSections();

  for (const section of sections) {
    const check = completionChecks[section.id];
    result[section.id] = check ? check(normalized) : false;
  }

  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] normalized keys with data:", {
      about: hasMeaningfulData(normalized.about),
      legacy: hasMeaningfulData(normalized.legacy),
      contacts: hasMeaningfulData(normalized.contacts),
      medical: hasMeaningfulData(normalized.medical),
      advance_directive: hasMeaningfulData(normalized.advance_directive),
      wishes: hasMeaningfulData(normalized.wishes),
      financial: hasMeaningfulData(normalized.financial),
      insurance: hasMeaningfulData(normalized.insurance),
      property: hasMeaningfulData(normalized.property),
      pets: hasMeaningfulData(normalized.pets),
      digital: hasMeaningfulData(normalized.digital),
      messages: hasMeaningfulData(normalized.messages),
      travel: hasMeaningfulData(normalized.travel),
    });
    console.log("[sectionCompletion] completion results:", result);
  }

  return result;
}

export function isSectionComplete(sectionId: string, planData: any): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}
