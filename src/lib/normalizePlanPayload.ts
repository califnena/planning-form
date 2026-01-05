/**
 * normalizePlanPayload
 *
 * SINGLE SOURCE OF TRUTH for reading section data from `plan_payload`.
 *
 * CANONICAL KEYS (per mandate):
 * - personal: object (Personal Information) - NOT personal_profile
 * - family: object (Family Information)
 * - online_accounts: object (was 'digital')
 * - messages_to_loved_ones: { main_message: string, individual: [] }
 * - legacy: { life_story: string }
 * 
 * Hard rules:
 * - No localStorage reads
 * - No new storage keys
 * - All consumers (completion + PDF mapping + shared view) should read from this normalized object.
 */

export interface RevisionRecord {
  revision_date: string;
  prepared_by: string;
  signature_png: string;
}

/**
 * Unified Contact type
 * contact_type: "person" (family/friends), "service" (funeral home, etc), "professional" (attorney, etc)
 */
export interface UnifiedContact {
  id?: string;
  name: string;
  contact_type: "person" | "professional" | "service_provider";
  organization?: string;
  role_or_relationship?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export type NormalizedPlanPayload = {
  // CANONICAL KEYS
  personal: Record<string, any>;
  family: Record<string, any>;
  online_accounts: Record<string, any>;
  messages_to_loved_ones: {
    main_message: string;
    individual: Array<{ to: string; message: string; audio_url?: string; video_url?: string }>;
  };
  legacy: Record<string, any>;
  revisions: RevisionRecord[];
  preparer_name: string;
  
  // CANONICAL: Unified contacts array
  contacts: UnifiedContact[];
  
  // Legacy arrays (kept for backwards compat, merged into contacts)
  contacts_professional: any[];
  service_providers: any[];
  
  // Other sections
  about: Record<string, any>;
  wishes: Record<string, any>;
  insurance: Record<string, any>;
  financial: Record<string, any>;
  property: Record<string, any>;
  pets: any[];
  digital: Record<string, any>; // Kept for backwards compat, maps to online_accounts
  messages: any[]; // Kept for backwards compat, maps to messages_to_loved_ones.individual
  medical: Record<string, any>;
  advance_directive: Record<string, any>;
  travel: Record<string, any>;
  notes: Record<string, any>;
  _raw: Record<string, any>;
};

function asObject(v: any): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function asArray(v: any): any[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/**
 * Recursively checks if a value is "meaningful".
 * - strings: trimmed length > 0
 * - numbers: not null/undefined and not NaN
 * - booleans: true is meaningful (only explicit opt-ins)
 * - arrays: any meaningful item
 * - objects: any meaningful nested value
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
 * Normalize raw plan_payload into a single stable shape.
 *
 * Merge precedence for each section key (later wins):
 * - raw[key]
 * - raw.data?.[key]
 * - raw.sections?.[key]
 *
 * Plus known synonyms used across the app.
 */
export function normalizePlanPayload(planPayload: any): NormalizedPlanPayload {
  const raw = asObject(planPayload);
  const rawData = asObject(raw.data);
  const rawSections = asObject(raw.sections);

  const mergedRoot = { ...raw, ...rawData, ...rawSections };

  // CANONICAL: personal (NOT personal_profile)
  const personal = {
    ...asObject(mergedRoot.personal),
    ...asObject(mergedRoot.personal_profile),
    ...asObject(mergedRoot.about_you),
    ...asObject(mergedRoot.personal_information),
    ...asObject(mergedRoot.about),
  };

  // CANONICAL: family (subset of personal or separate)
  const family = {
    ...asObject(mergedRoot.family),
    partner_name: personal.partner_name,
    child_names: personal.child_names,
    children: personal.children,
    father_name: personal.father_name,
    mother_name: personal.mother_name,
  };

  // CANONICAL: online_accounts (was 'digital')
  const online_accounts = {
    ...asObject(mergedRoot.online_accounts),
    ...asObject(mergedRoot.digital),
    ...asObject(mergedRoot.digital_accounts),
    ...asObject(mergedRoot.digital_assets),
  };

  // CANONICAL: messages_to_loved_ones
  const rawMessagesToLovedOnes = asObject(mergedRoot.messages_to_loved_ones);
  const oldMessages = asArray(mergedRoot.messages);
  
  // Migrate from old messages array if needed
  let messages_to_loved_ones: NormalizedPlanPayload['messages_to_loved_ones'] = {
    main_message: rawMessagesToLovedOnes.main_message || "",
    individual: asArray(rawMessagesToLovedOnes.individual),
  };
  
  // If old format exists and new doesn't have individual messages, migrate
  if (messages_to_loved_ones.individual.length === 0 && oldMessages.length > 0) {
    messages_to_loved_ones.individual = oldMessages.map((m: any) => ({
      to: m.recipients || m.to || "",
      message: m.text_message || m.message || m.body || "",
      audio_url: m.audio_url,
      video_url: m.video_url,
    }));
    
    if (import.meta.env.DEV) {
      console.log("[normalizePlanPayload] Migrated old messages to messages_to_loved_ones");
    }
  }

  // CANONICAL: legacy
  const legacy = {
    ...asObject(mergedRoot.legacy),
    ...asObject(mergedRoot.life_story),
    ...asObject(mergedRoot.lifeStory),
  };

  const funeral = {
    ...asObject(mergedRoot.funeral),
    ...asObject(mergedRoot.funeral_wishes),
    ...asObject(mergedRoot.wishes),
  };

  const insurance = {
    ...asObject(mergedRoot.insurance),
    ...asObject(mergedRoot.insurance_policies),
  };

  const financial = {
    ...asObject(mergedRoot.financial),
    ...asObject(mergedRoot.financial_life),
  };

  const property = {
    ...asObject(mergedRoot.property),
    ...asObject(mergedRoot.property_valuables),
    ...asObject(mergedRoot.properties),
    ...asObject(mergedRoot.valuables),
  };

  const healthcare = {
    ...asObject(mergedRoot.healthcare),
    ...asObject(mergedRoot.health_care),
    ...asObject(mergedRoot.medical),
  };

  const carePreferences = {
    ...asObject(mergedRoot.care_preferences),
    ...asObject(mergedRoot.care),
    ...asObject(mergedRoot.carePreferences),
  };

  const medical = {
    ...healthcare,
    care_preferences: carePreferences,
  };

  const advanceDirective = {
    ...asObject(mergedRoot.advance_directive),
    ...asObject(mergedRoot.advanceDirective),
  };

  const travel = {
    ...asObject(mergedRoot.travel),
    ...asObject(mergedRoot.travel_planning),
  };

  // CANONICAL: Unified contacts array
  // Merge from multiple sources and normalize to UnifiedContact shape
  const rawContactsArray = asArray(mergedRoot.contacts);
  const contactsObj = asObject(mergedRoot.contacts);
  const rawContactsNested = asArray(contactsObj.contacts);
  const rawImportantPeople = asArray(contactsObj.importantPeople);
  const rawContactsNotify = asArray(mergedRoot.contacts_notify);
  const rawProfessionalContacts = asArray(mergedRoot.contacts_professional);
  const rawServiceProviders = asArray(mergedRoot.service_providers);
  const rawVendors = asArray(mergedRoot.vendors);

  // Helper to normalize legacy contact formats to UnifiedContact
  const normalizeContact = (c: any, defaultType: "person" | "professional" | "service_provider"): UnifiedContact => {
    // Normalize legacy "service" to "service_provider"
    let contactType = c.contact_type || defaultType;
    if (contactType === "service") contactType = "service_provider";
    
    return {
      id: c.id || crypto.randomUUID(),
      name: c.name || c.full_name || "",
      contact_type: contactType,
      organization: c.organization || c.company || c.firm || "",
      role_or_relationship: c.role_or_relationship || c.role || c.type || c.relationship || "",
      phone: c.phone || c.phone_number || c.contact || "",
      email: c.email || "",
      notes: c.notes || c.note || "",
    };
  };

  // Build unified contacts array
  const unifiedContacts: UnifiedContact[] = [];
  const seenIds = new Set<string>();

  // Add from new canonical contacts array first (already in correct format)
  for (const c of rawContactsArray) {
    if (c && typeof c === "object" && c.contact_type) {
      const id = c.id || crypto.randomUUID();
      if (!seenIds.has(id)) {
        unifiedContacts.push({ ...c, id });
        seenIds.add(id);
      }
    }
  }

  // Migrate legacy person contacts (contacts_notify, importantPeople, nested contacts)
  for (const c of [...rawContactsNested, ...rawImportantPeople, ...rawContactsNotify]) {
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
      const normalized = normalizeContact(c, "service_provider");
      if (normalized.name && !seenIds.has(normalized.id!)) {
        unifiedContacts.push(normalized);
        seenIds.add(normalized.id!);
      }
    }
  }

  const pets = asArray(mergedRoot.pets);

  const notes = {
    ...asObject(mergedRoot.notes),
    ...asObject(mergedRoot.instructions),
  };

  // Legacy arrays for backwards compat (will be empty if migrated)
  const contacts_professional = rawProfessionalContacts;
  const service_providers = rawServiceProviders;

  // Revisions array for signature history
  const revisions = asArray(mergedRoot.revisions);
  const preparer_name = mergedRoot.preparer_name || mergedRoot.prepared_by || "";

  return {
    // CANONICAL KEYS
    personal,
    family,
    online_accounts,
    messages_to_loved_ones,
    legacy,
    revisions,
    preparer_name,
    
    // CANONICAL: Unified contacts
    contacts: unifiedContacts,
    
    // Legacy arrays (backwards compat)
    contacts_professional,
    service_providers,
    
    // Backwards compat aliases
    about: personal,
    digital: online_accounts,
    messages: messages_to_loved_ones.individual,
    
    // Other sections
    wishes: funeral,
    insurance,
    financial,
    property,
    pets,
    medical,
    advance_directive: advanceDirective,
    travel,
    notes,
    _raw: mergedRoot,
  };
}
