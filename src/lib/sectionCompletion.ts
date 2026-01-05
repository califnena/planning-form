/**
 * Section Completion Logic
 *
 * SINGLE SOURCE OF TRUTH for completion status on Plan Summary.
 *
 * CANONICAL KEYS:
 * - personal_information: object (core personal data: name, DOB, address, contact, military)
 * - about_you: object (family info: parents, children, faith, background)
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
      case "address":
        // CANONICAL: plan_payload.address
        // Complete when at least one field has a value
        const addressData = merged.address || data.address || {};
        if (addressData && typeof addressData === 'object') {
          const { full_name, street_1, street_2, city, state, postal_code, country, notes } = addressData as any;
          result[sectionId] = !!(
            (full_name && full_name.trim()) ||
            (street_1 && street_1.trim()) ||
            (street_2 && street_2.trim()) ||
            (city && city.trim()) ||
            (state && state.trim()) ||
            (postal_code && postal_code.trim()) ||
            (country && country.trim()) ||
            (notes && notes.trim())
          );
        } else {
          result[sectionId] = false;
        }
        break;
        
      case "personal":
        // CANONICAL: personal_information (core identity + address) AND about_you (family)
        const personalInfo = merged.personal_information || data.personal_information || {};
        const aboutYouData = merged.about_you || data.about_you || {};
        
        // Check personal_information for meaningful data
        const hasPersonalInfo = !!(
          personalInfo.full_legal_name?.trim() ||
          personalInfo.date_of_birth?.trim() ||
          personalInfo.phone?.trim() ||
          personalInfo.email?.trim() ||
          personalInfo.street_1?.trim() ||
          personalInfo.city?.trim()
        );
        
        // Check about_you for meaningful data
        const hasParents = Array.isArray(aboutYouData.parents) && 
          aboutYouData.parents.some((p: string) => p?.trim());
        const hasChildren = Array.isArray(aboutYouData.children) && 
          aboutYouData.children.some((c: string) => c?.trim());
        const hasAboutYou = hasParents || hasChildren || 
          !!(aboutYouData.family_notes?.trim()) ||
          !!(aboutYouData.faith_or_religion?.trim()) ||
          !!(aboutYouData.background_notes?.trim());
        
        // Fallback: check legacy 'personal' key for backwards compatibility
        const legacyPersonal = merged.personal || data.personal || {};
        const hasLegacyPersonal = hasMeaningfulData(legacyPersonal);
        
        result[sectionId] = hasPersonalInfo || hasAboutYou || hasLegacyPersonal;
        break;
        
      case "legacy":
        // CANONICAL: legacy.life_story
        result[sectionId] = hasMeaningfulData(
          merged.legacy || merged.life_story || merged.lifeStory || 
          data.legacy || data.life_story
        );
        break;
        
      case "contacts":
        // CANONICAL: people_to_notify - complete when length >= 1
        const peopleToNotify = merged.people_to_notify || merged.contacts || data.people_to_notify || data.contacts;
        result[sectionId] = Array.isArray(peopleToNotify) && peopleToNotify.length >= 1;
        break;
        
      case "healthcare":
        result[sectionId] = hasMeaningfulData(
          merged.healthcare || merged.health_care || merged.medical ||
          data.healthcare || data.medical
        );
        break;
        
      case "advancedirective":
        // CANONICAL: Section complete when has_advance_directive !== null
        const advDirective = merged.advance_directive || merged.advanceDirective || data.advance_directive;
        if (advDirective && typeof advDirective === 'object') {
          const ad = advDirective as { has_advance_directive?: string | null };
          result[sectionId] = ad.has_advance_directive !== null && ad.has_advance_directive !== undefined;
        } else {
          result[sectionId] = false;
        }
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
        // CANONICAL: online_accounts
        // Completion = (accounts.length >= 1) OR (access_instructions is non-empty)
        const onlineAccountsData = merged.online_accounts || merged.digital || data.online_accounts || data.digital;
        if (onlineAccountsData && typeof onlineAccountsData === 'object') {
          const oa = onlineAccountsData as { accounts?: any[]; access_instructions?: string };
          const hasAccounts = Array.isArray(oa.accounts) && oa.accounts.length >= 1;
          const hasInstructions = !!(oa.access_instructions && oa.access_instructions.trim());
          result[sectionId] = hasAccounts || hasInstructions;
        } else {
          result[sectionId] = false;
        }
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
        // CANONICAL: plan_payload.revisions[]
        // Complete when revisions.length >= 1 AND latest revision has signature_image_data_url
        const revisionsArray = merged.revisions || data.revisions || [];
        const signatureObjLegacy = merged.signature || data.signature;
        const legacySigRevisions = signatureObjLegacy?.revisions || [];
        
        // Check canonical format first
        if (Array.isArray(revisionsArray) && revisionsArray.length > 0) {
          result[sectionId] = revisionsArray.some((r: any) => 
            (r.signature_image_data_url && r.signature_image_data_url.trim()) ||
            (r.signature_image_png && r.signature_image_png.trim()) ||
            (r.signature_png && r.signature_png.trim())
          );
        } else if (Array.isArray(legacySigRevisions) && legacySigRevisions.length > 0) {
          // Legacy signature.revisions format
          result[sectionId] = legacySigRevisions.some((r: any) => 
            (r.signature_image_png && r.signature_image_png.trim())
          );
        } else if (signatureObjLegacy?.current?.signature_png) {
          // Legacy .current format
          result[sectionId] = !!(signatureObjLegacy.current.signature_png.trim());
        } else {
          result[sectionId] = false;
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
 * Check if contacts have any "person" type contact with a name
 * COMPLETION RULE: at least one contact with contact_type === "person" AND name
 */
function hasContactData(...sources: unknown[]): boolean {
  for (const source of sources) {
    if (!source) continue;
    
    // Array of contacts
    if (Array.isArray(source)) {
      // New completion rule: at least one "person" with a name
      if (source.some(c => isPersonContactWithName(c))) {
        return true;
      }
      continue;
    }
    
    // Object with nested contacts
    if (typeof source === "object") {
      const obj = source as Record<string, unknown>;
      
      // Check contacts array inside object
      if (Array.isArray(obj.contacts) && obj.contacts.some(c => isPersonContactWithName(c))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a contact is a "person" type with a name
 * This is the canonical completion check for contacts
 */
function isPersonContactWithName(contact: unknown): boolean {
  if (!contact || typeof contact !== "object") return false;
  const c = contact as Record<string, unknown>;
  
  // Must be contact_type "person" (or undefined for legacy data) AND have a name
  const isPerson = !c.contact_type || c.contact_type === "person";
  const hasName = !!(c.name && typeof c.name === "string" && c.name.trim());
  
  return isPerson && hasName;
}

/**
 * Check if a single section is complete.
 */
export function isSectionComplete(sectionId: string, planData: unknown): boolean {
  const completion = getSectionCompletion(planData);
  return completion[sectionId] || false;
}