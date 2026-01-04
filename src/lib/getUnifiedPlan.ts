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

export interface UnifiedContact {
  id?: string;
  name: string;
  contact_type: "person" | "service" | "professional";
  organization?: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UnifiedData {
  // CANONICAL KEYS
  personal_profile: Record<string, any>;
  family: Record<string, any>;
  online_accounts: Record<string, any>;
  messages_to_loved_ones: {
    main_message: string;
    individual: Array<{ to: string; message: string; audio_url?: string; video_url?: string }>;
  };
  legacy: Record<string, any>;
  revisions: Array<{ revision_date: string; prepared_by: string; signature_png: string }>;
  preparer_name: string;
  
  // CANONICAL: Unified contacts array
  contacts: UnifiedContact[];
  
  // Aliases for backwards compat
  about: Record<string, any>;
  lifeStory: Record<string, any>;
  onlineAccounts: Record<string, any>;
  messages: any[];
  
  // Other sections
  medical: Record<string, any>;
  advanceDirective: Record<string, any>;
  funeral: Record<string, any>;
  financial: Record<string, any>;
  insurance: Record<string, any>;
  property: Record<string, any>;
  pets: any[];
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

  // CANONICAL: personal_profile
  const personal_profile = mergeObjects(
    merged.personal_profile,
    merged.personal,
    merged.about_you,
    merged.personal_information,
    merged.about,
    raw.personal_profile // from personal_profiles table
  );

  // CANONICAL: family (subset of personal or separate)
  const family = mergeObjects(
    merged.family,
    { 
      partner_name: personal_profile.partner_name,
      child_names: personal_profile.child_names,
      children: personal_profile.children,
      father_name: personal_profile.father_name,
      mother_name: personal_profile.mother_name,
    }
  );

  // CANONICAL: legacy
  const legacy = mergeObjects(
    merged.legacy,
    merged.life_story,
    merged.lifeStory
  );

  // CANONICAL: Unified contacts array
  // Merge from multiple sources and normalize to UnifiedContact shape
  const payloadContacts = asArray(merged.contacts);
  const payloadContactsObj = asObject(merged.contacts);
  const payloadContactsNested = asArray(payloadContactsObj.contacts);
  const payloadImportantPeople = asArray(payloadContactsObj.importantPeople);
  const rawContactsNotify = asArray(raw.contacts_notify);
  const rawProfessionalContacts = asArray(raw.contacts_professional);
  const rawServiceProviders = asArray(merged.service_providers);
  const rawVendors = asArray(merged.vendors);

  // Helper to normalize legacy contact formats to UnifiedContact
  const normalizeContact = (c: any, defaultType: "person" | "service" | "professional"): UnifiedContact => ({
    id: c.id || crypto.randomUUID(),
    name: c.name || c.full_name || "",
    contact_type: c.contact_type || defaultType,
    organization: c.organization || c.company || c.firm || "",
    role: c.role || c.type || c.relationship || "",
    phone: c.phone || c.phone_number || c.contact || "",
    email: c.email || "",
    notes: c.notes || c.note || "",
  });

  // Build unified contacts array
  const unifiedContacts: UnifiedContact[] = [];
  const seenIds = new Set<string>();

  // Add from new canonical contacts array first (already in correct format)
  for (const c of payloadContacts) {
    if (c && typeof c === "object" && c.contact_type) {
      const id = c.id || crypto.randomUUID();
      if (!seenIds.has(id)) {
        unifiedContacts.push({ ...c, id });
        seenIds.add(id);
      }
    }
  }

  // Migrate legacy person contacts
  for (const c of [...payloadContactsNested, ...payloadImportantPeople, ...rawContactsNotify]) {
    if (c && typeof c === "object") {
      const normalized = normalizeContact(c, "person");
      if (normalized.name && !seenIds.has(normalized.id!)) {
        unifiedContacts.push(normalized);
        seenIds.add(normalized.id!);
      }
    }
  }

  // Migrate legacy professional contacts
  for (const c of rawProfessionalContacts) {
    if (c && typeof c === "object") {
      const normalized = normalizeContact(c, "professional");
      if (normalized.name && !seenIds.has(normalized.id!)) {
        unifiedContacts.push(normalized);
        seenIds.add(normalized.id!);
      }
    }
  }

  // Migrate legacy service providers and vendors
  for (const c of [...rawServiceProviders, ...rawVendors]) {
    if (c && typeof c === "object") {
      const normalized = normalizeContact(c, "service");
      if (normalized.name && !seenIds.has(normalized.id!)) {
        unifiedContacts.push(normalized);
        seenIds.add(normalized.id!);
      }
    }
  }

  const contacts = unifiedContacts;

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

  // CANONICAL: online_accounts (was 'digital')
  const online_accounts = mergeObjects(
    merged.online_accounts,
    merged.digital,
    merged.digital_accounts,
    merged.digital_assets
  );

  // CANONICAL: messages_to_loved_ones
  const rawMessagesToLovedOnes = asObject(merged.messages_to_loved_ones);
  const oldMessages = asArray(merged.messages);
  const tableMessages = asArray(raw.messages);
  
  let messages_to_loved_ones: UnifiedData['messages_to_loved_ones'] = {
    main_message: rawMessagesToLovedOnes.main_message || "",
    individual: asArray(rawMessagesToLovedOnes.individual),
  };
  
  // If old format exists and new doesn't have individual messages, migrate
  if (messages_to_loved_ones.individual.length === 0 && (oldMessages.length > 0 || tableMessages.length > 0)) {
    const sourceMessages = tableMessages.length > 0 ? tableMessages : oldMessages;
    messages_to_loved_ones.individual = sourceMessages.map((m: any) => ({
      to: m.recipients || m.to || m.audience || "",
      message: m.text_message || m.message || m.body || "",
      audio_url: m.audio_url,
      video_url: m.video_url,
    }));
  }
  
  // Keep backwards compat array
  const messages = messages_to_loved_ones.individual;

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

  // Revisions (signature history)
  const revisions = Array.isArray(merged.revisions) ? merged.revisions : [];
  const preparer_name = merged.preparer_name || merged.prepared_by || raw.preparer_name || "";

  return {
    // CANONICAL KEYS
    personal_profile,
    family,
    online_accounts,
    messages_to_loved_ones,
    legacy,
    revisions,
    preparer_name,
    
    // Aliases for backwards compat
    about: personal_profile,
    lifeStory: legacy,
    onlineAccounts: online_accounts,
    messages,
    
    // Other sections
    contacts,
    medical,
    advanceDirective,
    funeral,
    financial,
    insurance,
    property,
    pets,
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
    // CANONICAL keys
    personal: () => unified.personal_profile,
    legacy: () => unified.legacy,
    digital: () => unified.online_accounts,
    messages: () => {
      // Special check for messages_to_loved_ones
      return unified.messages_to_loved_ones.main_message?.trim() ||
        unified.messages_to_loved_ones.individual.some(i => i.message?.trim());
    },
    
    // Other sections
    contacts: () => unified.contacts,
    healthcare: () => unified.medical,
    advancedirective: () => unified.advanceDirective,
    funeral: () => unified.funeral,
    financial: () => unified.financial,
    insurance: () => unified.insurance,
    property: () => unified.property,
    pets: () => unified.pets,
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
 * Uses CANONICAL keys for consistency
 */
export function getUnifiedCompletion(unified: UnifiedData): Record<string, boolean> {
  // CANONICAL: messages completion check
  const messagesComplete = !!(
    unified.messages_to_loved_ones.main_message?.trim() ||
    unified.messages_to_loved_ones.individual.some(i => i.message?.trim())
  );
  
  return {
    personal: hasMeaningfulData(unified.personal_profile),
    legacy: hasMeaningfulData(unified.legacy),
    contacts: hasMeaningfulData(unified.contacts),
    healthcare: hasMeaningfulData(unified.medical),
    advancedirective: hasMeaningfulData(unified.advanceDirective),
    funeral: hasMeaningfulData(unified.funeral),
    financial: hasMeaningfulData(unified.financial),
    insurance: hasMeaningfulData(unified.insurance),
    property: hasMeaningfulData(unified.property),
    pets: hasMeaningfulData(unified.pets),
    digital: hasMeaningfulData(unified.online_accounts),
    messages: messagesComplete,
    travel: hasMeaningfulData(unified.travel),
  };
}
