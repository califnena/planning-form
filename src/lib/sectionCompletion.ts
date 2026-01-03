/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * Uses getSectionData to check REAL storage paths only.
 * No localStorage reads. No restructuring.
 */

import { getCompletableSections } from "./sectionRegistry";
import { getSectionData, hasMeaningfulData, logSectionDataStatus } from "./getSectionData";

// ============= SECTION COMPLETION =============

/**
 * Check if contacts have any real data (not just empty objects)
 */
function hasContactData(contacts: unknown): boolean {
  if (!Array.isArray(contacts)) {
    // Could be object with contacts array inside
    if (contacts && typeof contacts === "object") {
      const obj = contacts as Record<string, unknown>;
      if (Array.isArray(obj.contacts)) {
        return hasContactData(obj.contacts);
      }
    }
    return hasMeaningfulData(contacts);
  }
  if (contacts.length === 0) return false;
  return contacts.some((c) => {
    if (!c || typeof c !== "object") return false;
    const contact = c as Record<string, unknown>;
    return !!(contact.name || contact.phone || contact.email || contact.relationship);
  });
}

/**
 * Registry ID to section key mapping for data lookup.
 * Some IDs match directly, others need translation.
 */
const SECTION_KEY_MAP: Record<string, string> = {
  personal: "personal",
  legacy: "legacy",
  contacts: "contacts",
  healthcare: "healthcare",
  advancedirective: "advancedirective",
  funeral: "funeral",
  financial: "financial",
  insurance: "insurance",
  property: "property",
  pets: "pets",
  messages: "messages",
  digital: "digital",
  travel: "travel",
};

/**
 * Get completion status for all sections from plan data.
 * 
 * Data sources checked:
 * 1. planData.plan_payload (primary storage)
 * 2. planData top-level keys (buildPlanDataForPdf spreads normalized data there)
 */
export function getSectionCompletion(planData: unknown): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const sections = getCompletableSections();
  
  // Get the payload - could be in plan_payload or at top level
  const data = planData as Record<string, unknown> | null;
  if (!data) {
    // No data, all incomplete
    for (const section of sections) {
      result[section.id] = false;
    }
    return result;
  }
  
  // Primary: check plan_payload
  const planPayload = data.plan_payload;
  
  // Secondary: check top-level keys (buildPlanDataForPdf output)
  // Merge approach: check payload first, then top-level fallback
  const combinedPayload = {
    // From plan_payload
    ...(typeof planPayload === "object" && planPayload !== null ? planPayload : {}),
    // Top-level fallbacks (only if not already in payload)
    personal: data.personal || data.about_you || (planPayload as Record<string, unknown>)?.personal,
    legacy: data.legacy || data.life_story || (planPayload as Record<string, unknown>)?.legacy,
    contacts: data.contacts || (planPayload as Record<string, unknown>)?.contacts,
    healthcare: data.healthcare || data.medical || (planPayload as Record<string, unknown>)?.healthcare,
    advance_directive: data.advance_directive || (planPayload as Record<string, unknown>)?.advance_directive,
    funeral: data.funeral || data.wishes || (planPayload as Record<string, unknown>)?.funeral,
    financial: data.financial || (planPayload as Record<string, unknown>)?.financial,
    insurance: data.insurance || (planPayload as Record<string, unknown>)?.insurance,
    property: data.property || (planPayload as Record<string, unknown>)?.property,
    pets: data.pets || (planPayload as Record<string, unknown>)?.pets,
    digital: data.digital || (planPayload as Record<string, unknown>)?.digital,
    messages: data.messages || (planPayload as Record<string, unknown>)?.messages,
    travel: data.travel || (planPayload as Record<string, unknown>)?.travel,
    // Also check contacts_notify table data
    contacts_notify: data.contacts_notify,
  };

  // DEV logging
  logSectionDataStatus(combinedPayload, "sectionCompletion");

  for (const section of sections) {
    const sectionKey = SECTION_KEY_MAP[section.id];
    if (!sectionKey) {
      result[section.id] = false;
      continue;
    }
    
    const sectionData = getSectionData(combinedPayload, sectionKey);
    
    // Special case for contacts - needs deeper check
    if (section.id === "contacts") {
      result[section.id] = hasContactData(sectionData);
      continue;
    }
    
    result[section.id] = hasMeaningfulData(sectionData);
  }

  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] completion results:", result);
  }

  return result;
}

/**
 * Check if a single section is complete.
 */
export function isSectionComplete(sectionId: string, planData: unknown): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}
