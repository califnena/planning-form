/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * Hard rule (per mandate): completion is computed from normalized plan data.
 * No localStorage reads.
 * 
 * Data sources checked (in order of precedence):
 * 1. planData.plan_payload (normalized)
 * 2. planData top-level keys (from buildPlanDataForPdf merged output)
 * 3. Related table data (contacts_notify, pets, etc.)
 */

import { getCompletableSections } from "./sectionRegistry";
import { hasMeaningfulData, normalizePlanPayload } from "./normalizePlanPayload";

// ============= SECTION COMPLETION =============

function hasContactData(contacts: any[]): boolean {
  if (!Array.isArray(contacts) || contacts.length === 0) return false;
  return contacts.some((c) => c && (c.name || c.phone || c.email || c.relationship));
}

/**
 * Build a merged normalized object from all available data sources in planData.
 * This handles cases where data may be in plan_payload OR at top-level keys.
 */
function buildNormalizedFromPlanData(planData: any): ReturnType<typeof normalizePlanPayload> {
  // First normalize from plan_payload
  const fromPayload = normalizePlanPayload(planData?.plan_payload);
  
  // Also check top-level keys (buildPlanDataForPdf spreads data there)
  const topLevel = {
    about: planData?.personal || planData?.about_you || planData?.about || {},
    legacy: planData?.legacy || planData?.life_story || {},
    contacts: planData?.contacts?.contacts || planData?.contacts_notify || [],
    wishes: planData?.funeral || planData?.wishes || {},
    insurance: planData?.insurance || {},
    financial: planData?.financial || {},
    property: planData?.property || {},
    pets: planData?.pets || [],
    digital: planData?.digital || {},
    messages: planData?.messages || [],
    medical: planData?.healthcare || planData?.medical || {},
    advance_directive: planData?.advance_directive || {},
    travel: planData?.travel || {},
    notes: planData?.notes || {},
  };
  
  // Merge: top-level wins if it has data
  return {
    about: hasMeaningfulData(topLevel.about) ? topLevel.about : fromPayload.about,
    legacy: hasMeaningfulData(topLevel.legacy) ? topLevel.legacy : fromPayload.legacy,
    contacts: (Array.isArray(topLevel.contacts) && topLevel.contacts.length > 0) 
      ? topLevel.contacts 
      : fromPayload.contacts,
    wishes: hasMeaningfulData(topLevel.wishes) ? topLevel.wishes : fromPayload.wishes,
    insurance: hasMeaningfulData(topLevel.insurance) ? topLevel.insurance : fromPayload.insurance,
    financial: hasMeaningfulData(topLevel.financial) ? topLevel.financial : fromPayload.financial,
    property: hasMeaningfulData(topLevel.property) ? topLevel.property : fromPayload.property,
    pets: (Array.isArray(topLevel.pets) && topLevel.pets.length > 0) 
      ? topLevel.pets 
      : fromPayload.pets,
    digital: hasMeaningfulData(topLevel.digital) ? topLevel.digital : fromPayload.digital,
    messages: (Array.isArray(topLevel.messages) && topLevel.messages.length > 0) 
      ? topLevel.messages 
      : fromPayload.messages,
    medical: hasMeaningfulData(topLevel.medical) ? topLevel.medical : fromPayload.medical,
    advance_directive: hasMeaningfulData(topLevel.advance_directive) ? topLevel.advance_directive : fromPayload.advance_directive,
    travel: hasMeaningfulData(topLevel.travel) ? topLevel.travel : fromPayload.travel,
    notes: hasMeaningfulData(topLevel.notes) ? topLevel.notes : fromPayload.notes,
    _raw: fromPayload._raw,
  };
}

const completionChecks: Record<string, (n: ReturnType<typeof normalizePlanPayload>) => boolean> = {
  // Registry ids mapped to normalized keys
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
  // Build normalized data from ALL sources (plan_payload + top-level)
  const normalized = buildNormalizedFromPlanData(planData);

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
