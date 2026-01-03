/**
 * getActivePlanId.ts
 * 
 * SINGLE SOURCE OF TRUTH for resolving the active plan_id for a user.
 * 
 * ALL code that reads/writes plan data MUST use this function to ensure
 * consistency. This prevents the "different planId for different pages" bug.
 * 
 * Resolution rules (in order):
 * 1. Find user's org from org_members (prefer "owner" role, then any role)
 * 2. Find existing plan by org_id + owner_user_id (newest by updated_at)
 * 3. Fallback: Find plan directly by owner_user_id (newest by updated_at)
 * 4. If still no plan, optionally create one
 */

import { supabase } from "@/integrations/supabase/client";

export interface ActivePlanResult {
  planId: string | null;
  orgId: string | null;
  plan: any | null;
}

/**
 * Resolves the active plan for a user.
 * 
 * @param userId - The user's ID
 * @param createIfMissing - If true, creates a plan if none exists (default: false)
 */
export async function getActivePlanId(
  userId: string,
  createIfMissing: boolean = false
): Promise<ActivePlanResult> {
  if (!userId) {
    console.warn("[getActivePlanId] No userId provided");
    return { planId: null, orgId: null, plan: null };
  }

  let orgId: string | null = null;
  let planId: string | null = null;
  let plan: any = null;

  // Step 1: Get user's org - prefer "owner" role first, then any role
  const { data: ownerMembership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownerMembership?.org_id) {
    orgId = ownerMembership.org_id;
  } else {
    // Try any role
    const { data: anyMembership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (anyMembership?.org_id) {
      orgId = anyMembership.org_id;
    }
  }

  // Step 2: Find existing plan by org_id + owner_user_id
  if (orgId) {
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("org_id", orgId)
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPlan) {
      planId = existingPlan.id;
      plan = existingPlan;
    }
  }

  // Step 3: Fallback - find plan directly by owner_user_id
  if (!planId) {
    const { data: fallbackPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackPlan) {
      planId = fallbackPlan.id;
      plan = fallbackPlan;
      orgId = fallbackPlan.org_id || orgId;
    }
  }

  // Step 4: Create if missing (optional)
  if (!planId && createIfMissing) {
    // Ensure org exists
    if (!orgId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const orgName = profile?.full_name 
        ? `${profile.full_name}'s Organization` 
        : "Personal";

      const { data: newOrg } = await supabase
        .from("orgs")
        .insert({ name: orgName })
        .select("id")
        .single();

      if (newOrg) {
        orgId = newOrg.id;
        await supabase.from("org_members").insert({
          org_id: orgId,
          user_id: userId,
          role: "owner",
        });
      }
    }

    if (orgId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const { data: newPlan, error: planError } = await supabase
        .from("plans")
        .insert({
          org_id: orgId,
          owner_user_id: userId,
          title: "My Final Wishes Plan",
          prepared_for: profile?.full_name || null,
          plan_payload: {},
        })
        .select("*")
        .single();

      if (!planError && newPlan) {
        planId = newPlan.id;
        plan = newPlan;
        console.log("[getActivePlanId] Created new plan:", planId);
      } else {
        console.error("[getActivePlanId] Failed to create plan:", planError);
      }
    }
  }

  if (import.meta.env.DEV) {
    console.log("[getActivePlanId] Resolved:", { userId, planId, orgId, hasData: !!plan });
  }

  return { planId, orgId, plan };
}

/**
 * Fetches table counts for a given plan_id.
 * Used for debugging to verify data is going to the right plan.
 */
export async function getPlanTableCounts(planId: string): Promise<Record<string, number>> {
  if (!planId) return {};

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
  ]);

  return {
    personal_profiles: personalProfiles || 0,
    contacts_notify: contactsNotify || 0,
    messages: messages || 0,
    pets: pets || 0,
    properties: properties || 0,
    insurance_policies: insurancePolicies || 0,
    bank_accounts: bankAccounts || 0,
    investments: investments || 0,
    debts: debts || 0,
  };
}
