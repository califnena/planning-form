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
 * - CRITICAL: Also reads directly from the plan object's top-level keys (for data stored via usePlanData)
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

  // Also try to read the main plan from localStorage (this is where usePlanData stores everything)
  try {
    // Find any plan key in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("plan_")) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            // Merge section data from localStorage plan
            for (const sectionKey of ["financial", "digital", "property", "pets", "messages", "insurance", "contacts", "funeral", "healthcare", "care_preferences", "advance_directive", "travel", "personal", "about_you", "legal", "legacy", "preplanning"]) {
              if (parsed[sectionKey] && typeof parsed[sectionKey] === "object" && Object.keys(parsed[sectionKey]).length > 0) {
                result[sectionKey] = parsed[sectionKey];
              }
            }
          }
        }
        break; // Only use the first plan found
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return result;
}

/**
 * Supports legacy shapes:
 * - plan_payload.data
 * - plan_payload.plan_payload
 * - plan_payload.plan_payload.data
 * - Top-level section keys on the plan object itself (from usePlanData merge)
 * 
 * @param plan - The plan object from DB or usePlanData
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

  // CRITICAL FIX: The `raw` object from usePlanData already has section data at top level
  // (usePlanData merges plan_payload into the plan object on load)
  // So we need to read from BOTH plan_payload AND the top-level keys
  
  // Merge order: localStorage -> DB plan_payload nested -> DB plan_payload -> top-level plan keys (newest wins)
  const merged: Record<string, any> = {
    // Start with localStorage fallbacks (lowest priority for DB sections, but needed for legacy localStorage-only sections)
    ...localDrafts,
    // Then DB nested structures
    ...payloadNestedData,
    ...payloadNested,
    ...payloadData,
    ...payload,
    // CRITICAL: Top-level section keys from the plan object itself (highest priority)
    // These come from usePlanData which merges plan_payload into the plan object
    ...(raw.financial && typeof raw.financial === "object" ? { financial: raw.financial } : {}),
    ...(raw.digital && typeof raw.digital === "object" ? { digital: raw.digital } : {}),
    ...(raw.property && typeof raw.property === "object" ? { property: raw.property } : {}),
    ...(raw.pets ? { pets: raw.pets } : {}),
    ...(raw.messages ? { messages: raw.messages } : {}),
    ...(raw.insurance && typeof raw.insurance === "object" ? { insurance: raw.insurance } : {}),
    ...(raw.contacts ? { contacts: raw.contacts } : {}),
    ...(raw.funeral && typeof raw.funeral === "object" ? { funeral: raw.funeral } : {}),
    ...(raw.healthcare && typeof raw.healthcare === "object" ? { healthcare: raw.healthcare } : {}),
    ...(raw.care_preferences && typeof raw.care_preferences === "object" ? { care_preferences: raw.care_preferences } : {}),
    ...(raw.advance_directive && typeof raw.advance_directive === "object" ? { advance_directive: raw.advance_directive } : {}),
    ...(raw.travel && typeof raw.travel === "object" ? { travel: raw.travel } : {}),
    ...(raw.personal && typeof raw.personal === "object" ? { personal: raw.personal } : {}),
    ...(raw.about_you && typeof raw.about_you === "object" ? { about_you: raw.about_you } : {}),
    ...(raw.legal && typeof raw.legal === "object" ? { legal: raw.legal } : {}),
    ...(raw.legacy && typeof raw.legacy === "object" ? { legacy: raw.legacy } : {}),
    ...(raw.preplanning && typeof raw.preplanning === "object" ? { preplanning: raw.preplanning } : {}),
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
  const healthcare = merged.healthcare ?? merged.health_care ?? merged.medical ?? {};
  const care_preferences = merged.care_preferences ?? merged.carePreferences ?? {};
  const advance_directive = merged.advance_directive ?? merged.advanceDirective ?? {};
  const travel = merged.travel ?? {};

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
