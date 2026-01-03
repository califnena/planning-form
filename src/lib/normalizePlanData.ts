/**
 * normalizePlanData (legacy wrapper)
 *
 * This project historically used normalizePlanData(plan, userId?) to produce a
 * `normalized.data` object for completion + PDF pipelines.
 *
 * Per the "One plan. One truth." mandate:
 * - We do NOT read from localStorage.
 * - We normalize ONLY from `plan.plan_payload`.
 *
 * New code should prefer `normalizePlanPayload(plan.plan_payload)` directly.
 */

import { normalizePlanPayload } from "./normalizePlanPayload";

export type NormalizedPlanData<TPlan extends Record<string, any> = Record<string, any>> = {
  raw: TPlan;
  payload: Record<string, any>;
  data: Record<string, any>;
};

function asObject(v: any): Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

/**
 * @param plan - The plan object (must include `plan_payload`)
 */
export function normalizePlanData<TPlan extends Record<string, any> = Record<string, any>>(
  plan: TPlan | null | undefined,
  _userId?: string
): NormalizedPlanData<TPlan> {
  const raw = (plan ?? ({} as TPlan)) as TPlan;
  const payload = asObject((raw as any).plan_payload);

  const n = normalizePlanPayload(payload);

  // Preserve the historical `data.<section>` shape used across the app.
  const data = {
    personal: n.about,
    about_you: n.about,
    legacy: n.legacy,
    contacts: { contacts: n.contacts, importantPeople: [] },
    healthcare: n.medical,
    care_preferences: n.medical?.care_preferences || {},
    advance_directive: n.advance_directive,
    funeral: n.wishes,
    insurance: n.insurance,
    financial: n.financial,
    property: n.property,
    pets: n.pets,
    digital: n.digital,
    messages: n.messages,
    travel: n.travel,
    notes: n.notes,
    _raw: n._raw,
  };

  return { raw, payload, data };
}
