/**
 * normalizePlanData
 *
 * Single, canonical normalizer for reading planner section data.
 *
 * Contract:
 * - Uses DB-backed `plan_payload` as the source of truth.
 * - Flattens legacy nesting shapes so callers can always read from `normalized.data`.
 * - Merges duplicate contact arrays into one unified list.
 * - Reads from localStorage as fallback for legacy data (healthcare, care, advance_directive, travel).
 */

export type NormalizedPlanData<TPlan extends Record<string, any> = Record<string, any>> = {
  /** Original plan object (untouched) */
  raw: TPlan;
  /** Raw plan_payload object from DB (if present) */
  payload: Record<string, any>;
  /** Canonical section data object */
  data: {
    personal: any;
    about_you: any;
    contacts: any;
    healthcare: any;
    care_preferences: any;
    advance_directive: any;
    funeral: any;
    financial: any;
    insurance: any;
    property: any;
    pets: any;
    messages: any;
    digital: any;
    travel: any;
    preplanning: any;
    legal: any;
    legacy: any;
    [key: string]: any;
  };
};

function asObject(v: any): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function asArray(v: any): any[] {
  return Array.isArray(v) ? v : [];
}

/**
 * Merge contact arrays from different sources into one unified list.
 * Handles: contacts, importantPeople, contacts_notify, professional_contacts
 */
function mergeContactArrays(sources: any[]): any[] {
  const merged: any[] = [];
  const seen = new Set<string>();

  for (const src of sources) {
    const arr = asArray(src);
    for (const contact of arr) {
      if (!contact || typeof contact !== "object") continue;
      // Dedupe by name+phone/email combo
      const key = `${contact.name || ""}|${contact.phone || ""}|${contact.email || ""}`.toLowerCase();
      if (key !== "||" && !seen.has(key)) {
        seen.add(key);
        merged.push(contact);
      } else if (key === "||" && (contact.name || contact.relationship)) {
        // Keep entries that have at least name or relationship
        merged.push(contact);
      }
    }
  }

  return merged;
}

/**
 * Read localStorage drafts for sections that may have legacy data.
 * Only used as fallback when DB data is empty.
 */
function readLocalStorageDrafts(userId?: string): Record<string, any> {
  if (!userId || typeof window === "undefined") return {};

  const result: Record<string, any> = {};

  // Try to read legacy localStorage keys
  const legacyKeys = [
    { localKey: `health_care_${userId}`, dataKey: "healthcare" },
    { localKey: `care_preferences_${userId}`, dataKey: "care_preferences" },
    { localKey: `advance_directive_${userId}`, dataKey: "advance_directive" },
    { localKey: `travel_planning_${userId}`, dataKey: "travel" },
  ];

  for (const { localKey, dataKey } of legacyKeys) {
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          result[dataKey] = parsed;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return result;
}

/**
 * Supports legacy shapes:
 * - plan_payload.data
 * - plan_payload.plan_payload
 * - plan_payload.plan_payload.data
 * 
 * @param plan - The plan object from DB
 * @param userId - Optional user ID to read localStorage fallbacks
 */
export function normalizePlanData<TPlan extends Record<string, any> = Record<string, any>>(
  plan: TPlan | null | undefined,
  userId?: string
): NormalizedPlanData<TPlan> {
  const raw = (plan ?? ({} as TPlan)) as TPlan;

  // Extract plan_payload with multiple fallback shapes
  const payload = asObject((raw as any).plan_payload);
  const payloadData = asObject(payload.data);
  const payloadNested = asObject(payload.plan_payload);
  const payloadNestedData = asObject(payloadNested.data);

  // Read localStorage fallbacks for legacy data
  const localDrafts = readLocalStorageDrafts(userId);

  // Merge order: oldest -> newest (newest wins)
  // Also merge direct top-level keys from the plan object itself
  const merged: Record<string, any> = {
    ...payloadNestedData,
    ...payloadNested,
    ...payloadData,
    ...payload,
    // Also check for section data at the plan root level (from buildPlanDataForPdf)
    ...(raw.financial ? { financial: raw.financial } : {}),
    ...(raw.digital ? { digital: raw.digital } : {}),
    ...(raw.property ? { property: raw.property } : {}),
    ...(raw.pets ? { pets: raw.pets } : {}),
    ...(raw.messages ? { messages: raw.messages } : {}),
    ...(raw.insurance ? { insurance: raw.insurance } : {}),
    ...(raw.contacts ? { contacts: raw.contacts } : {}),
    ...(raw.funeral ? { funeral: raw.funeral } : {}),
    ...(raw.healthcare ? { healthcare: raw.healthcare } : {}),
    ...(raw.care_preferences ? { care_preferences: raw.care_preferences } : {}),
    ...(raw.advance_directive ? { advance_directive: raw.advance_directive } : {}),
    ...(raw.travel ? { travel: raw.travel } : {}),
    ...(raw.personal ? { personal: raw.personal } : {}),
    ...(raw.about_you ? { about_you: raw.about_you } : {}),
    ...(raw.legal ? { legal: raw.legal } : {}),
    ...(raw.legacy ? { legacy: raw.legacy } : {}),
    ...(raw.preplanning ? { preplanning: raw.preplanning } : {}),
  };

  // Canonical section keys. Always defined.
  const personal = merged.personal ?? merged.about_you ?? merged.aboutYou ?? {};
  const about_you = merged.about_you ?? merged.aboutYou ?? merged.personal ?? {};

  // Merge all contact arrays into one unified contacts list
  const unifiedContacts = mergeContactArrays([
    merged.contacts,
    merged.importantPeople,
    merged.contacts_notify,
    merged.professional_contacts,
    asObject(merged.contacts).contacts,
    asObject(merged.contacts).importantPeople,
  ]);

  // Build contacts object - support both array and object formats
  const contactsData = typeof merged.contacts === "object" && !Array.isArray(merged.contacts)
    ? { ...merged.contacts, contacts: unifiedContacts }
    : { contacts: unifiedContacts };

  // For sections that may have localStorage fallbacks, use them if DB is empty
  const healthcare = merged.healthcare ?? merged.health_care ?? merged.medical ?? localDrafts.healthcare ?? {};
  const care_preferences = merged.care_preferences ?? merged.carePreferences ?? localDrafts.care_preferences ?? {};
  const advance_directive = merged.advance_directive ?? merged.advanceDirective ?? localDrafts.advance_directive ?? {};
  const travel = merged.travel ?? localDrafts.travel ?? {};

  // Start with merged data, then override with normalized versions
  const data = {
    ...merged,
    personal: personal ?? {},
    about_you: about_you ?? {},
    contacts: contactsData,
    healthcare,
    care_preferences,
    advance_directive,
    funeral: merged.funeral ?? {},
    financial: merged.financial ?? {},
    insurance: merged.insurance ?? {},
    property: merged.property ?? {},
    pets: Array.isArray(merged.pets) ? merged.pets : (merged.pets ? [merged.pets] : []),
    messages: Array.isArray(merged.messages) ? merged.messages : (merged.messages ? [merged.messages] : []),
    digital: merged.digital ?? {},
    travel,
    preplanning: merged.preplanning ?? {},
    legal: merged.legal ?? {},
    legacy: merged.legacy ?? {},
  };

  return { raw, payload, data };
}
