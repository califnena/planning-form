/**
 * getUnifiedPlan.ts
 * 
 * SINGLE SOURCE OF TRUTH for reading plan data.
 * 
 * This function:
 * 1. Fetches plan data from DB (via buildPlanDataForPdf pattern)
 * 2. Returns unified normalized object with consistent keys
 * 3. Merges data from plan_payload + top-level related tables
 * 
 * REAL STORAGE PATHS (from usePlanData.ts):
 * - Section components call updatePlan({...updates})
 * - usePlanData separates PLAN_TABLE_COLUMNS vs SECTION_DATA_KEYS
 * - SECTION_DATA_KEYS go into plan_payload: funeral, financial, insurance, 
 *   property, pets, digital, messages, contacts, healthcare, care_preferences,
 *   advance_directive, travel, preplanning, personal, about_you, legal, legacy
 * 
 * Related tables also store data:
 * - contacts_notify -> important contacts
 * - pets -> pet records
 * - properties -> real estate
 * - insurance_policies -> insurance
 * - messages -> farewell messages
 * - bank_accounts, investments, debts -> financial
 * - personal_profiles -> about you
 */

import { supabase } from "@/integrations/supabase/client";
import { getActivePlanId } from "@/lib/getActivePlanId";

// ============= TYPES =============

export interface UnifiedPlan {
  // Raw plan object from DB
  raw: Record<string, any>;
  // The plan_payload object
  payload: Record<string, any>;
  // Normalized unified data with consistent keys
  unified: UnifiedData;
  // Plan metadata
  planId: string | null;
  orgId: string | null;
}

export interface UnifiedData {
  about: Record<string, any>;
  family: Record<string, any>;
  lifeStory: Record<string, any>;
  contacts: {
    keyContacts: any[];
    importantContacts: any[];
    emergencyContacts: any[];
    merged: any[];
  };
  medical: Record<string, any>;
  advanceDirective: Record<string, any>;
  funeral: Record<string, any>;
  financial: Record<string, any>;
  insurance: Record<string, any>;
  property: Record<string, any>;
  pets: any[];
  onlineAccounts: Record<string, any>;
  messages: any[];
  travel: Record<string, any>;
  notes: Record<string, any>;
}

// ============= HELPERS =============

function asObject(v: any): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function asArray(v: any): any[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/**
 * Recursively checks if a value has meaningful data.
 * - strings: non-whitespace content
 * - numbers: not null/NaN  
 * - booleans: true only (represents explicit user choice)
 * - arrays: any item with meaningful data
 * - objects: any nested value with meaningful data
 */
export function hasMeaningfulData(value: unknown): boolean {
  if (value === undefined || value === null) return false;

  if (typeof value === "boolean") return value === true;

  if (typeof value === "number") return !Number.isNaN(value);

  if (typeof value === "string") return value.trim().length > 0;

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

/**
 * Merge multiple sources into one, later sources win (but only if they have data)
 */
function mergeObjects(...sources: Record<string, any>[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const source of sources) {
    const obj = asObject(source);
    for (const [key, value] of Object.entries(obj)) {
      if (hasMeaningfulData(value)) {
        result[key] = value;
      } else if (!(key in result)) {
        result[key] = value;
      }
    }
  }
  return result;
}

// ============= NORMALIZATION =============

/**
 * Build normalized unified data from payload + raw (top-level table data)
 * 
 * Merge precedence (last wins):
 * 1. payload.<key>
 * 2. payload.data?.<key>
 * 3. payload.sections?.<key>
 * 4. top-level raw fields (from related tables)
 */
function buildUnifiedData(payload: Record<string, any>, raw: Record<string, any>): UnifiedData {
  const payloadData = asObject(payload.data);
  const payloadSections = asObject(payload.sections);
  
  // Merged payload sources
  const merged = { ...payload, ...payloadData, ...payloadSections };

  // About You / Personal
  const about = mergeObjects(
    merged.personal,
    merged.about_you,
    merged.personal_information,
    merged.about,
    raw.personal_profile // from personal_profiles table
  );

  // Family (subset of personal or separate)
  const family = mergeObjects(
    merged.family,
    { 
      partner_name: about.partner_name,
      child_names: about.child_names,
      father_name: about.father_name,
      mother_name: about.mother_name,
    }
  );

  // Life Story / Legacy  
  const lifeStory = mergeObjects(
    merged.legacy,
    merged.life_story,
    merged.lifeStory
  );

  // Contacts - handle multiple sources
  const payloadContacts = asArray(merged.contacts);
  const payloadContactsObj = asObject(merged.contacts);
  const payloadContactsNested = asArray(payloadContactsObj.contacts);
  const payloadImportantPeople = asArray(payloadContactsObj.importantPeople);
  const payloadKeyContacts = asArray(payloadContactsObj.keyContacts);
  const payloadEmergency = asArray(payloadContactsObj.emergencyContacts);
  const contactsNotify = asArray(raw.contacts_notify);
  const rawKeyContacts = asArray(raw.key_contacts);
  const rawImportantContacts = asArray(raw.important_contacts);

  const contacts = {
    keyContacts: [...payloadKeyContacts, ...rawKeyContacts].filter(Boolean),
    importantContacts: [...payloadContacts, ...payloadContactsNested, ...payloadImportantPeople, ...contactsNotify, ...rawImportantContacts].filter(Boolean),
    emergencyContacts: payloadEmergency.filter(Boolean),
    merged: [...new Set([
      ...payloadContacts,
      ...payloadContactsNested,
      ...payloadImportantPeople,
      ...payloadKeyContacts,
      ...payloadEmergency,
      ...contactsNotify,
      ...rawKeyContacts,
      ...rawImportantContacts
    ].filter(Boolean))]
  };

  // Medical & Care
  const medical = mergeObjects(
    merged.healthcare,
    merged.health_care,
    merged.medical,
    { care_preferences: mergeObjects(merged.care_preferences, merged.care, merged.carePreferences) }
  );

  // Advance Directive
  const advanceDirective = mergeObjects(
    merged.advance_directive,
    merged.advanceDirective
  );

  // Funeral Wishes
  const funeral = mergeObjects(
    merged.funeral,
    merged.funeral_wishes,
    merged.wishes
  );

  // Financial - include related table data
  const financial = mergeObjects(
    merged.financial,
    merged.financial_life,
    {
      bank_accounts: asArray(raw.bank_accounts),
      investments: asArray(raw.investments),
      debts: asArray(raw.debts),
    }
  );

  // Insurance
  const insurance = mergeObjects(
    merged.insurance,
    merged.insurance_policies,
    { policies: asArray(raw.insurance_policies) }
  );

  // Property & Valuables
  const property = mergeObjects(
    merged.property,
    merged.property_valuables,
    merged.properties,
    { items: asArray(raw.properties) }
  );

  // Pets
  const payloadPets = asArray(merged.pets);
  const tablePets = asArray(raw.pets);
  const pets = tablePets.length > 0 ? tablePets : payloadPets;

  // Online Accounts / Digital
  const onlineAccounts = mergeObjects(
    merged.digital,
    merged.digital_accounts,
    merged.digital_assets
  );

  // Messages
  const payloadMessages = asArray(merged.messages);
  const tableMessages = asArray(raw.messages);
  const messages = tableMessages.length > 0 ? tableMessages : payloadMessages;

  // Travel
  const travel = mergeObjects(
    merged.travel,
    merged.travel_planning
  );

  // Notes
  const notes = mergeObjects(
    merged.notes,
    merged.instructions,
    { 
      instructions_notes: raw.instructions_notes,
      about_me_notes: raw.about_me_notes,
      checklist_notes: raw.checklist_notes,
    }
  );

  return {
    about,
    family,
    lifeStory,
    contacts,
    medical,
    advanceDirective,
    funeral,
    financial,
    insurance,
    property,
    pets,
    onlineAccounts,
    messages,
    travel,
    notes,
  };
}

// ============= MAIN FUNCTION =============

/**
 * Get unified plan data for a user.
 * This is the SINGLE ENTRY POINT for reading plan data.
 * 
 * Uses centralized getActivePlanId for consistent plan resolution.
 */
export async function getUnifiedPlan(userId: string): Promise<UnifiedPlan> {
  // Use centralized plan resolution
  const { planId, orgId, plan } = await getActivePlanId(userId);

  // If no plan exists, return empty
  if (!planId || !plan) {
    return {
      raw: {},
      payload: {},
      unified: buildUnifiedData({}, {}),
      planId: null,
      orgId: null,
    };
  }

  // Fetch related table data in parallel using the resolved planId
  const [
    { data: personalProfile },
    { data: contacts },
    { data: pets },
    { data: insurance },
    { data: properties },
    { data: messages },
    { data: investments },
    { data: debts },
    { data: bankAccounts },
    { data: professionalContacts },
  ] = await Promise.all([
    supabase.from("personal_profiles").select("*").eq("plan_id", planId).maybeSingle(),
    supabase.from("contacts_notify").select("*").eq("plan_id", planId),
    supabase.from("pets").select("*").eq("plan_id", planId),
    supabase.from("insurance_policies").select("*").eq("plan_id", planId),
    supabase.from("properties").select("*").eq("plan_id", planId),
    supabase.from("messages").select("*").eq("plan_id", planId),
    supabase.from("investments").select("*").eq("plan_id", planId),
    supabase.from("debts").select("*").eq("plan_id", planId),
    supabase.from("bank_accounts").select("*").eq("plan_id", planId),
    supabase.from("contacts_professional").select("*").eq("plan_id", planId),
  ]);

  // Build raw object with all table data
  const raw: Record<string, any> = {
    ...plan,
    personal_profile: personalProfile || {},
    contacts_notify: contacts || [],
    pets: pets || [],
    insurance_policies: insurance || [],
    properties: properties || [],
    messages: messages || [],
    investments: investments || [],
    debts: debts || [],
    bank_accounts: bankAccounts || [],
    contacts_professional: professionalContacts || [],
  };

  // Extract plan_payload
  const payload = (typeof plan.plan_payload === "object" && plan.plan_payload !== null)
    ? (plan.plan_payload as Record<string, any>)
    : {};

  // Build unified normalized data
  const unified = buildUnifiedData(payload, raw);

  if (import.meta.env.DEV) {
    console.log("[getUnifiedPlan] planId:", planId);
    console.log("[getUnifiedPlan] payload keys:", Object.keys(payload));
    console.log("[getUnifiedPlan] unified sections with data:", 
      Object.entries(unified)
        .filter(([_, v]) => hasMeaningfulData(v))
        .map(([k]) => k)
    );
  }

  return {
    raw,
    payload,
    unified,
    planId,
    orgId,
  };
}

// ============= SECTION HELPERS =============

/**
 * Check if a specific section has data in the unified plan
 */
export function hasUnifiedSectionData(unified: UnifiedData, sectionId: string): boolean {
  const keyMap: Record<string, () => unknown> = {
    personal: () => unified.about,
    legacy: () => unified.lifeStory,
    contacts: () => unified.contacts.merged,
    healthcare: () => unified.medical,
    advancedirective: () => unified.advanceDirective,
    funeral: () => unified.funeral,
    financial: () => unified.financial,
    insurance: () => unified.insurance,
    property: () => unified.property,
    pets: () => unified.pets,
    digital: () => unified.onlineAccounts,
    messages: () => unified.messages,
    travel: () => unified.travel,
  };

  const getter = keyMap[sectionId];
  if (!getter) {
    if (import.meta.env.DEV) {
      console.warn(`[hasUnifiedSectionData] Unknown section: ${sectionId}`);
    }
    return false;
  }

  return hasMeaningfulData(getter());
}

/**
 * Get completion status for all sections from unified plan
 */
export function getUnifiedCompletion(unified: UnifiedData): Record<string, boolean> {
  return {
    personal: hasMeaningfulData(unified.about),
    legacy: hasMeaningfulData(unified.lifeStory),
    contacts: hasMeaningfulData(unified.contacts.merged),
    healthcare: hasMeaningfulData(unified.medical),
    advancedirective: hasMeaningfulData(unified.advanceDirective),
    funeral: hasMeaningfulData(unified.funeral),
    financial: hasMeaningfulData(unified.financial),
    insurance: hasMeaningfulData(unified.insurance),
    property: hasMeaningfulData(unified.property),
    pets: hasMeaningfulData(unified.pets),
    digital: hasMeaningfulData(unified.onlineAccounts),
    messages: hasMeaningfulData(unified.messages),
    travel: hasMeaningfulData(unified.travel),
  };
}
