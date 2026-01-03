/**
 * scorePlan.ts
 * 
 * Scores plans by the amount of real data they contain.
 * Used to select the canonical plan when a user has multiple plans.
 * 
 * CRITICAL: This prevents selecting an empty plan when data exists elsewhere.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PlanScore {
  planId: string;
  score: number;
  tableCounts: Record<string, number>;
  payloadKeyCount: number;
  updatedAt: string;
}

/**
 * Calculates a score for a plan based on how much real data it contains.
 * Higher score = more data = better candidate for active plan.
 */
export async function scorePlan(planId: string): Promise<PlanScore> {
  // Fetch table counts in parallel
  const [
    { count: personalProfiles },
    { count: contactsNotify },
    { count: messages },
    { count: pets },
    { count: properties },
    { count: insurancePolicies },
    { count: bankAccounts },
    { count: investments },
    { count: debts },
    { count: funeralFunding },
    { count: businesses },
    { count: professionalContacts },
    { data: plan },
  ] = await Promise.all([
    supabase.from("personal_profiles").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("contacts_notify").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("pets").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("insurance_policies").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("bank_accounts").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("investments").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("debts").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("funeral_funding").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("contacts_professional").select("*", { count: "exact", head: true }).eq("plan_id", planId),
    supabase.from("plans").select("plan_payload, updated_at").eq("id", planId).maybeSingle(),
  ]);

  const tableCounts: Record<string, number> = {
    personal_profiles: personalProfiles || 0,
    contacts_notify: contactsNotify || 0,
    messages: messages || 0,
    pets: pets || 0,
    properties: properties || 0,
    insurance_policies: insurancePolicies || 0,
    bank_accounts: bankAccounts || 0,
    investments: investments || 0,
    debts: debts || 0,
    funeral_funding: funeralFunding || 0,
    businesses: businesses || 0,
    contacts_professional: professionalContacts || 0,
  };

  // Count meaningful keys in plan_payload
  let payloadKeyCount = 0;
  if (plan?.plan_payload && typeof plan.plan_payload === 'object') {
    const payload = plan.plan_payload as Record<string, any>;
    payloadKeyCount = countMeaningfulPayloadKeys(payload);
  }

  // Calculate score:
  // - Each row in related table = +5 points
  // - Each meaningful key in plan_payload = +2 points
  // - Recency bonus = 0-5 points based on updated_at
  let score = 0;
  
  for (const count of Object.values(tableCounts)) {
    score += count * 5;
  }
  
  score += payloadKeyCount * 2;
  
  // Recency bonus (up to 5 points for plans updated in the last 7 days)
  if (plan?.updated_at) {
    const updatedAt = new Date(plan.updated_at);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      score += Math.round(5 * (1 - daysSinceUpdate / 7));
    }
  }

  const result: PlanScore = {
    planId,
    score,
    tableCounts,
    payloadKeyCount,
    updatedAt: plan?.updated_at || '',
  };

  if (import.meta.env.DEV) {
    console.log("[scorePlan] Plan", planId, "score:", score, "tableCounts:", tableCounts, "payloadKeys:", payloadKeyCount);
  }

  return result;
}

/**
 * Counts meaningful keys in plan_payload.
 * A key is meaningful if it has non-empty data.
 */
function countMeaningfulPayloadKeys(payload: Record<string, any>, depth = 0): number {
  if (depth > 3) return 0; // Prevent infinite recursion
  
  let count = 0;
  
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') {
      if (value.trim().length > 0) count++;
    } else if (typeof value === 'number') {
      count++;
    } else if (typeof value === 'boolean') {
      count++; // Explicit boolean choice counts
    } else if (Array.isArray(value)) {
      if (value.length > 0) count++;
    } else if (typeof value === 'object') {
      const nestedCount = countMeaningfulPayloadKeys(value, depth + 1);
      if (nestedCount > 0) count++;
    }
  }
  
  return count;
}

/**
 * Scores all plans for a user and returns them sorted by score (highest first).
 */
export async function scoreAllPlans(planIds: string[]): Promise<PlanScore[]> {
  if (!planIds.length) return [];
  
  const scores = await Promise.all(planIds.map(id => scorePlan(id)));
  
  // Sort by score descending, then by updated_at descending for ties
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  if (import.meta.env.DEV) {
    console.log("[scoreAllPlans] Ranking:", scores.map(s => ({ planId: s.planId, score: s.score })));
  }
  
  return scores;
}

/**
 * Selects the best plan from a list of candidates.
 * Returns the planId with the highest score.
 */
export async function selectBestPlan(planIds: string[]): Promise<string | null> {
  const scores = await scoreAllPlans(planIds);
  return scores.length > 0 ? scores[0].planId : null;
}
