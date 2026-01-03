/**
 * normalizePlanData
 *
 * Single, canonical normalizer for reading planner section data.
 *
 * Contract:
 * - Uses DB-backed `plan_payload` as the source of truth.
 * - Flattens legacy nesting shapes so callers can always read from `normalized.data`.
 * - Does NOT read from localStorage.
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

/**
 * Supports legacy shapes:
 * - plan_payload.data
 * - plan_payload.plan_payload
 * - plan_payload.plan_payload.data
 */
export function normalizePlanData<TPlan extends Record<string, any> = Record<string, any>>(
  plan: TPlan | null | undefined
): NormalizedPlanData<TPlan> {
  const raw = (plan ?? ({} as TPlan)) as TPlan;

  const payload = asObject((raw as any).plan_payload);
  const payloadData = asObject(payload.data);
  const payloadNested = asObject(payload.plan_payload);
  const payloadNestedData = asObject(payloadNested.data);

  // Merge order: oldest -> newest (newest wins)
  const merged = {
    ...payloadNestedData,
    ...payloadNested,
    ...payloadData,
    ...payload,
  };

  // Canonical section keys. Always defined.
  const personal = merged.personal ?? merged.about_you ?? merged.aboutYou ?? {};
  const about_you = merged.about_you ?? merged.aboutYou ?? merged.personal ?? {};

  const data = {
    personal: personal ?? {},
    about_you: about_you ?? {},
    contacts: merged.contacts ?? {},
    healthcare: merged.healthcare ?? merged.health_care ?? merged.medical ?? {},
    care_preferences: merged.care_preferences ?? merged.carePreferences ?? {},
    advance_directive: merged.advance_directive ?? merged.advanceDirective ?? {},
    funeral: merged.funeral ?? {},
    financial: merged.financial ?? {},
    insurance: merged.insurance ?? {},
    property: merged.property ?? {},
    pets: merged.pets ?? [],
    messages: merged.messages ?? [],
    digital: merged.digital ?? {},
    travel: merged.travel ?? {},
    preplanning: merged.preplanning ?? {},
    legal: merged.legal ?? {},
    legacy: merged.legacy ?? {},
    // keep any other keys as-is
    ...merged,
  };

  // Ensure array-typed sections are arrays
  if (!Array.isArray(data.pets)) data.pets = [];
  if (!Array.isArray(data.messages)) data.messages = [];

  return { raw, payload, data };
}
