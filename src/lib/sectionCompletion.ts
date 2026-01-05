/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * CANONICAL KEYS:
 * - personal: object (NOT personal_profile)
 * - family: object  
 * - online_accounts: object (was 'digital')
 * - messages_to_loved_ones: { main_message: string, individual: [] }
 * - legacy: { life_story: string }
 */

import { getCompletableSections } from "./sectionRegistry";
import { hasMeaningfulData, type UnifiedData, getUnifiedCompletion } from "./getUnifiedPlan";

// ============= EXPORTS FOR COMPATIBILITY =============

// Re-export hasMeaningfulData for backwards compatibility
export { hasMeaningfulData };

// ============= SECTION COMPLETION =============

/**
 * Get completion status for all sections from unified plan data.
 * 
 * This is the ONLY function that should be used to determine completion.
 * It works with the UnifiedData structure from getUnifiedPlan.
 */
export function getSectionCompletionFromUnified(unified: UnifiedData): Record<string, boolean> {
  return getUnifiedCompletion(unified);
}

/**
 * Get completion status for all sections from raw plan data.
 * 
 * This function is for backwards compatibility with existing code that
 * passes buildPlanDataForPdf output. It extracts data and computes completion.
 * 
 * @param planData - Raw plan data from buildPlanDataForPdf or similar
 */
export function getSectionCompletion(planData: unknown): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const sections = getCompletableSections();
  
  const data = planData as Record<string, unknown> | null;
  if (!data) {
    for (const section of sections) {
      result[section.id] = false;
    }
    return result;
  }
  
  // Extract plan_payload and merge with top-level keys
  const planPayload = data.plan_payload as Record<string, unknown> | undefined;
  const payloadObj = planPayload && typeof planPayload === "object" ? planPayload : {};
  const payloadData = (payloadObj as any).data || {};
  const payloadSections = (payloadObj as any).sections || {};
  
  // Merge all sources for checking
  const merged = { ...payloadObj, ...payloadData, ...payloadSections };
  
  // Check each section using CANONICAL keys
  for (const section of sections) {
    const sectionId = section.id;
    
    switch (sectionId) {
      case "personal":
        // CANONICAL: personal (NOT personal_profile)
        result[sectionId] = hasMeaningfulData(
          merged.personal || merged.personal_profile || merged.about_you || merged.about ||
          data.personal || data.personal_profile || data.about_you
        );
        break;
        
      case "legacy":
        // CANONICAL: legacy.life_story
        result[sectionId] = hasMeaningfulData(
          merged.legacy || merged.life_story || merged.lifeStory || 
          data.legacy || data.life_story
        );
        break;
        
      case "contacts":
        // Check multiple contact sources
        result[sectionId] = hasContactData(
          merged.contacts,
          data.contacts,
          data.contacts_notify
        );
        break;
        
      case "healthcare":
        result[sectionId] = hasMeaningfulData(
          merged.healthcare || merged.health_care || merged.medical ||
          data.healthcare || data.medical
        );
        break;
        
      case "advancedirective":
        result[sectionId] = hasMeaningfulData(
          merged.advance_directive || merged.advanceDirective ||
          data.advance_directive
        );
        break;
        
      case "funeral":
        result[sectionId] = hasMeaningfulData(
          merged.funeral || merged.funeral_wishes || merged.wishes ||
          data.funeral
        );
        break;
        
      case "financial":
        result[sectionId] = hasMeaningfulData(
          merged.financial || merged.financial_life || data.financial
        ) || hasArrayData(data.bank_accounts) || hasArrayData(data.investments) || hasArrayData(data.debts);
        break;
        
      case "insurance":
        result[sectionId] = hasMeaningfulData(
          merged.insurance || merged.insurance_policies || data.insurance
        ) || hasArrayData(data.insurance_policies);
        break;
        
      case "property":
        result[sectionId] = hasMeaningfulData(
          merged.property || merged.property_valuables || merged.properties || data.property
        ) || hasArrayData(data.properties);
        break;
        
      case "pets":
        result[sectionId] = hasArrayData(data.pets) || hasArrayData(merged.pets);
        break;
        
      case "digital":
        // CANONICAL: online_accounts (also check old 'digital' key for migration)
        result[sectionId] = hasMeaningfulData(
          merged.online_accounts || merged.digital || merged.digital_accounts || merged.digital_assets ||
          data.online_accounts || data.digital
        );
        break;
        
      case "messages":
        // CANONICAL: messages_to_loved_ones
        // Complete if main_message non-empty OR any individual[].message non-empty
        const msgData = merged.messages_to_loved_ones || data.messages_to_loved_ones;
        if (msgData && typeof msgData === 'object') {
          const m = msgData as { main_message?: string; individual?: any[] };
          const hasMainMessage = !!(m.main_message && m.main_message.trim());
          const hasIndividualMessage = Array.isArray(m.individual) && 
            m.individual.some((i: any) => i.message && i.message.trim());
          result[sectionId] = hasMainMessage || hasIndividualMessage;
        } else {
          // Fallback to old messages array
          result[sectionId] = hasArrayData(data.messages) || hasArrayData(merged.messages);
        }
        break;
        
      case "travel":
        result[sectionId] = hasMeaningfulData(
          merged.travel || merged.travel_planning || data.travel
        );
        break;
        
      case "signature":
        // Check new signature.current structure first, then legacy revisions[]
        const signatureObj = merged.signature || data.signature;
        if (signatureObj?.current?.signature_png) {
          // New data model: signature.current.signature_png
          result[sectionId] = !!(signatureObj.current.signature_png && signatureObj.current.signature_png.trim());
        } else {
          // Legacy: check revisions array for signature_png
          const legacyRevisions = signatureObj?.revisions || merged.revisions || data.revisions;
          if (Array.isArray(legacyRevisions) && legacyRevisions.length > 0) {
            result[sectionId] = legacyRevisions.some((r: any) => r.signature_png && r.signature_png.trim());
          } else {
            result[sectionId] = false;
          }
        }
        break;
        
      default:
        result[sectionId] = false;
    }
  }

  if (import.meta.env.DEV) {
    console.log("[sectionCompletion] completion results:", result);
  }

  return result;
}

// ============= HELPERS =============

/**
 * Check if array has meaningful data
 */
function hasArrayData(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some(item => hasMeaningfulData(item));
}

/**
 * Check if contacts have any real data from multiple sources
 */
function hasContactData(...sources: unknown[]): boolean {
  for (const source of sources) {
    if (!source) continue;
    
    // Array of contacts
    if (Array.isArray(source)) {
      if (source.length > 0 && source.some(c => hasRealContactData(c))) {
        return true;
      }
      continue;
    }
    
    // Object with nested contacts
    if (typeof source === "object") {
      const obj = source as Record<string, unknown>;
      
      // Check contacts array inside object
      if (Array.isArray(obj.contacts) && obj.contacts.some(c => hasRealContactData(c))) {
        return true;
      }
      
      // Check importantPeople array
      if (Array.isArray(obj.importantPeople) && obj.importantPeople.some(c => hasRealContactData(c))) {
        return true;
      }
      
      // Check keyContacts array
      if (Array.isArray(obj.keyContacts) && obj.keyContacts.some(c => hasRealContactData(c))) {
        return true;
      }
      
      // Check emergencyContacts array
      if (Array.isArray(obj.emergencyContacts) && obj.emergencyContacts.some(c => hasRealContactData(c))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a single contact record has real data
 */
function hasRealContactData(contact: unknown): boolean {
  if (!contact || typeof contact !== "object") return false;
  const c = contact as Record<string, unknown>;
  return !!(
    (c.name && typeof c.name === "string" && c.name.trim()) ||
    (c.phone && typeof c.phone === "string" && c.phone.trim()) ||
    (c.email && typeof c.email === "string" && c.email.trim()) ||
    (c.relationship && typeof c.relationship === "string" && c.relationship.trim()) ||
    (c.contact && typeof c.contact === "string" && c.contact.trim())
  );
}

/**
 * Check if a single section is complete.
 */
export function isSectionComplete(sectionId: string, planData: unknown): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}