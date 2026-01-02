// Shared completion logic for planner sections.
// IMPORTANT: Keep this in sync with the data object used for PDF generation.

export type CompletionStatus = "completed" | "not_started";

const hasText = (v: unknown) => (v ?? "").toString().trim().length > 0;
const hasTrue = (obj: unknown) => {
  if (!obj || typeof obj !== "object") return false;
  return Object.values(obj as Record<string, unknown>).some((v) => v === true);
};
const hasItems = (arr: unknown) => Array.isArray(arr) && arr.length > 0;

export function getSectionCompletion(planData: any): Record<string, boolean> {
  const pd = planData ?? {};
  const profile = pd.personal_profile ?? {};

  return {
    // About you
    personal: hasText(profile.full_name) || hasText(profile.preferred_name) || hasText(profile.phone) || hasText(profile.email),

    // Important contacts
    contacts: hasItems(pd.contacts_notify) || hasItems(pd.contacts) || hasItems(pd.contacts_professional),

    // Medical & care (stored in planData for consistency; may originate from localStorage)
    healthcare: hasItems(pd.healthcare?.conditions) || hasItems(pd.healthcare?.allergies) || hasItems(pd.healthcare?.medications) || hasText(pd.healthcare?.doctorPharmacy?.primaryDoctorName) || hasText(pd.healthcare?.advanceDirectiveStatus) || hasText(pd.healthcare?.dnrPolstStatus) || hasText(pd.healthcare?.travelProtectionStatus),

    carepreferences: hasTrue(pd.care_preferences?.checks) || hasText(pd.care_preferences?.notes),

    // Core notes sections
    funeral: hasText(pd.funeral_wishes_notes),
    insurance: hasItems(pd.insurance_policies) || hasText(pd.insurance_notes),
    property: hasItems(pd.properties) || hasText(pd.property_notes),
    pets: hasItems(pd.pets) || hasText(pd.pets_notes),
    messages: hasItems(pd.messages) || hasText(pd.messages_notes) || hasText(pd.to_loved_ones_message),

    // Pre-planning checklist area
    preplanning: hasTrue(pd.preplanning?.checks) || hasText(pd.preplanning?.notes),

    // Travel & away-from-home planning
    travel: hasTrue(pd.travel?.checks) || hasText(pd.travel?.notes),
  };
}
