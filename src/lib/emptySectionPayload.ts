/**
 * Empty Section Payload Defaults
 * 
 * Returns the empty/default state for each section's plan_payload key.
 * Used for the "Clear this section" feature.
 */

export function getEmptySectionPayload(sectionKey: string): any {
  switch (sectionKey) {
    case "address":
      return {
        full_name: null,
        street_1: null,
        street_2: null,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        notes: null,
        last_updated: null,
      };

    case "personal":
    case "personal_profile":
    case "about_you":
      return {
        full_name: null,
        preferred_name: null,
        dob: null,
        birthplace: null,
        citizenship: null,
        marital_status: null,
        religion: null,
        last_updated: null,
      };

    case "family":
      return {
        spouse_name: null,
        children: [],
        parents: [],
        siblings: [],
        notes: null,
        last_updated: null,
      };

    case "online_accounts":
    case "digital":
      return {
        warning_acknowledged: false,
        accounts: [],
        access_instructions: null,
        password_manager_used: null,
        password_manager_name: null,
        last_updated: null,
      };

    case "messages_to_loved_ones":
    case "messages":
      return {
        main_message: null,
        individual: [],
        last_updated: null,
      };

    case "legacy":
      return {
        life_story: null,
        accomplishments: null,
        hobbies: null,
        remembered: null,
        last_updated: null,
      };

    case "healthcare":
    case "medical":
      return {
        conditions: [],
        medications: [],
        allergies: [],
        primary_physician: null,
        notes: null,
        last_updated: null,
      };

    case "care_preferences":
    case "care":
      return {
        preferences: [],
        notes: null,
        last_updated: null,
      };

    case "advance_directive":
      return {
        has_directive: null,
        location: null,
        healthcare_proxy: null,
        notes: null,
        last_updated: null,
      };

    case "funeral":
      return {
        disposition: null,
        service_type: null,
        location: null,
        music: [],
        readings: [],
        special_requests: null,
        notes: null,
        last_updated: null,
      };

    case "insurance":
      return {
        policies: [],
        notes: null,
        last_updated: null,
      };

    case "contacts":
    case "people_to_notify":
      return {
        contacts: [],
        notes: null,
        last_updated: null,
      };

    case "contacts_professional":
      return {
        contacts: [],
        notes: null,
        last_updated: null,
      };

    case "service_providers":
      return {
        providers: [],
        notes: null,
        last_updated: null,
      };

    case "financial":
      return {
        bank_accounts: [],
        investments: [],
        debts: [],
        notes: null,
        last_updated: null,
      };

    case "property":
      return {
        properties: [],
        valuables: [],
        notes: null,
        last_updated: null,
      };

    case "pets":
      return {
        pets: [],
        notes: null,
        last_updated: null,
      };

    case "travel":
      return {
        documents: [],
        memberships: [],
        notes: null,
        last_updated: null,
      };

    case "preplanning":
      return {
        checklist_items: [],
        notes: null,
        last_updated: null,
      };

    case "revisions":
    case "signature":
      return [];

    case "legal":
      return {
        will_location: null,
        trust_location: null,
        poa_location: null,
        notes: null,
        last_updated: null,
      };

    default:
      // Generic empty object
      return {
        last_updated: null,
      };
  }
}

/**
 * Maps section IDs to their canonical payload keys
 */
export function getSectionPayloadKey(sectionId: string): string {
  const keyMap: Record<string, string> = {
    address: "address",
    personal: "personal",
    legacy: "legacy",
    healthcare: "healthcare",
    advancedirective: "advance_directive",
    funeral: "funeral",
    insurance: "insurance",
    contacts: "people_to_notify",
    financial: "financial",
    property: "property",
    pets: "pets",
    messages: "messages_to_loved_ones",
    travel: "travel",
    digital: "online_accounts",
    signature: "revisions",
    preplanning: "preplanning",
  };
  
  return keyMap[sectionId] || sectionId;
}
