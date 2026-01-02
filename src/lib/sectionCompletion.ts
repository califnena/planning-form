// Shared completion logic for planner sections.
// IMPORTANT: Keep this in sync with the data object used for PDF generation.
// This is the SINGLE SOURCE OF TRUTH for determining section completion.

export type CompletionStatus = "completed" | "not_started";

const hasText = (v: unknown) => (v ?? "").toString().trim().length > 0;

const hasTrue = (obj: unknown) => {
  if (!obj || typeof obj !== "object") return false;
  return Object.values(obj as Record<string, unknown>).some((v) => v === true);
};

const hasItems = (arr: unknown) => Array.isArray(arr) && arr.length > 0;

/**
 * Checks if an object has any meaningful value (non-empty string, true boolean, or non-empty array)
 * Excludes: undefined, null, empty string, "unsure", false, empty arrays, empty objects
 */
const hasAnyMeaningfulValue = (obj: unknown): boolean => {
  if (!obj || typeof obj !== "object") return false;
  
  const values = Object.values(obj as Record<string, unknown>);
  return values.some((v) => {
    if (v === undefined || v === null || v === "" || v === "unsure" || v === false) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return hasAnyMeaningfulValue(v); // Recurse into nested objects
    if (typeof v === "boolean") return v === true;
    if (typeof v === "string") return v.trim().length > 0;
    return true; // Numbers, etc.
  });
};

/**
 * Computes completion status for each section based on stored data.
 * A section is "complete" if it has at least one meaningful value.
 */
export function getSectionCompletion(planData: any): Record<string, boolean> {
  const pd = planData ?? {};
  const profile = pd.personal_profile ?? {};
  const payload = pd.plan_payload ?? {};

  // Helper to check payload OR direct property
  const checkSection = (key: string): boolean => {
    const fromPayload = payload[key];
    const fromDirect = pd[key];
    return hasAnyMeaningfulValue(fromPayload) || hasAnyMeaningfulValue(fromDirect);
  };

  return {
    // About you - check profile fields
    personal: hasText(profile.full_name) || hasText(profile.preferred_name) || 
              hasText(profile.phone) || hasText(profile.email) ||
              hasText(profile.address) || hasText(profile.birthplace) ||
              checkSection("about_you"),

    // Important contacts - check contact arrays
    contacts: hasItems(pd.contacts_notify) || hasItems(pd.contacts) || 
              hasItems(pd.contacts_professional) ||
              checkSection("contacts"),

    // Medical & care - check healthcare object with all its fields
    healthcare: hasItems(pd.healthcare?.conditions) || 
                hasItems(pd.healthcare?.allergies) || 
                hasItems(pd.healthcare?.medications) || 
                hasText(pd.healthcare?.doctorPharmacy?.primaryDoctorName) || 
                hasText(pd.healthcare?.advanceDirectiveStatus) || 
                hasText(pd.healthcare?.dnrPolstStatus) || 
                hasText(pd.healthcare?.travelProtectionStatus) ||
                hasAnyMeaningfulValue(pd.healthcare) ||
                checkSection("medical"),

    // Care preferences
    carepreferences: hasTrue(pd.care_preferences?.checks) || 
                     hasText(pd.care_preferences?.notes) || 
                     hasItems(pd.care_preferences?.preferences) ||
                     hasAnyMeaningfulValue(pd.care_preferences) ||
                     checkSection("care_preferences"),

    // Advance directive
    advancedirective: hasText(pd.advance_directive?.healthcareProxyName) || 
                      hasAnyMeaningfulValue(pd.advance_directive) ||
                      checkSection("advance_directive"),

    // Travel planning
    travel: hasAnyMeaningfulValue(pd.travel) || 
            hasText(pd.travel?.emergencyContact) || 
            hasText(pd.travel?.notes) ||
            checkSection("travel"),

    // FUNERAL WISHES - Check nested funeral object AND notes field
    // This is the key fix: funeral data is stored under `funeral` not `funeral_wishes_notes`
    funeral: hasText(pd.funeral_wishes_notes) || 
             hasAnyMeaningfulValue(pd.funeral) ||
             checkSection("funeral"),

    // Insurance - check both array and notes
    insurance: hasItems(pd.insurance_policies) || 
               hasText(pd.insurance_notes) ||
               checkSection("insurance"),

    // Property - check both array and notes
    property: hasItems(pd.properties) || 
              hasText(pd.property_notes) ||
              checkSection("property"),

    // Pets
    pets: hasItems(pd.pets) || 
          hasText(pd.pets_notes) ||
          checkSection("pets"),

    // Messages
    messages: hasItems(pd.messages) || 
              hasText(pd.messages_notes) || 
              hasText(pd.to_loved_ones_message) ||
              checkSection("messages"),

    // Digital
    digital: hasText(pd.digital_notes) ||
             checkSection("digital"),

    // Pre-planning checklist
    preplanning: hasTrue(pd.preplanning?.checks) || 
                 hasText(pd.preplanning?.notes) ||
                 hasAnyMeaningfulValue(pd.preplanning) ||
                 checkSection("preplanning_checklist"),
  };
}
