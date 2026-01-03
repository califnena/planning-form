/**
 * getActivePlanId.ts
 * 
 * SINGLE SOURCE OF TRUTH for resolving the active plan_id for a user.
 * 
 * ALL code that reads/writes plan data MUST use this function to ensure
 * consistency. This prevents the "different planId for different pages" bug.
 * 
 * Resolution rules (in order):
 * 1. Read user_settings.active_plan_id - if it exists AND the plan exists, use it
 * 2. If missing, find all plans for user and pick the one with most data (scorePlan)
 * 3. Save that id into user_settings.active_plan_id
 * 4. Only create a new plan if the user has zero plans total
 */

import { supabase } from "@/integrations/supabase/client";
import { selectBestPlan } from "@/lib/scorePlan";

export interface ActivePlanResult {
  planId: string | null;
  orgId: string | null;
  plan: any | null;
}

/**
 * Resolves the active plan for a user.
 * Uses user_settings.active_plan_id as the stable selector.
 * Falls back to plan scoring to pick the best plan if not set.
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

  // Step 1: Check user_settings.active_plan_id first
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_plan_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (settings?.active_plan_id) {
    // Verify this plan still exists
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", settings.active_plan_id)
      .maybeSingle();

    if (existingPlan) {
      if (import.meta.env.DEV) {
        console.log("[getActivePlanId] Using stored active_plan_id:", settings.active_plan_id);
      }
      return {
        planId: existingPlan.id,
        orgId: existingPlan.org_id,
        plan: existingPlan,
      };
    }
    // Plan was deleted, need to pick a new one
  }

  // Step 2: Find all plans owned by user
  const { data: userPlans } = await supabase
    .from("plans")
    .select("id, org_id, owner_user_id")
    .eq("owner_user_id", userId);

  if (userPlans && userPlans.length > 0) {
    // Use plan scoring to pick the best one
    const planIds = userPlans.map(p => p.id);
    const bestPlanId = await selectBestPlan(planIds);

    if (bestPlanId) {
      // Fetch the full plan
      const { data: bestPlan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", bestPlanId)
        .maybeSingle();

      if (bestPlan) {
        // Save to user_settings for next time
        await saveActivePlanId(userId, bestPlanId);
        
        if (import.meta.env.DEV) {
          console.log("[getActivePlanId] Selected best plan via scoring:", bestPlanId);
        }
        
        return {
          planId: bestPlan.id,
          orgId: bestPlan.org_id,
          plan: bestPlan,
        };
      }
    }
  }

  // Step 3: No plans exist - optionally create one
  if (createIfMissing) {
    const result = await createNewPlanForUser(userId);
    if (result.planId) {
      await saveActivePlanId(userId, result.planId);
    }
    return result;
  }

  if (import.meta.env.DEV) {
    console.log("[getActivePlanId] No plan found for user:", userId);
  }

  return { planId: null, orgId: null, plan: null };
}

/**
 * Saves the active_plan_id to user_settings.
 */
async function saveActivePlanId(userId: string, planId: string): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, active_plan_id: planId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[getActivePlanId] Failed to save active_plan_id:", error);
  } else if (import.meta.env.DEV) {
    console.log("[getActivePlanId] Saved active_plan_id:", planId, "for user:", userId);
  }
}

/**
 * Creates a new plan for a user who has no plans.
 */
async function createNewPlanForUser(userId: string): Promise<ActivePlanResult> {
  // Get or create org
  let orgId: string | null = null;

  // Check for existing org membership
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membership?.org_id) {
    orgId = membership.org_id;
  } else {
    // Create new org
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

  if (!orgId) {
    console.error("[getActivePlanId] Failed to get/create org for user:", userId);
    return { planId: null, orgId: null, plan: null };
  }

  // Create new plan
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

  if (planError || !newPlan) {
    console.error("[getActivePlanId] Failed to create plan:", planError);
    return { planId: null, orgId, plan: null };
  }

  if (import.meta.env.DEV) {
    console.log("[getActivePlanId] Created new plan:", newPlan.id);
  }

  return {
    planId: newPlan.id,
    orgId: newPlan.org_id,
    plan: newPlan,
  };
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

/**
 * Clears the active_plan_id for a user (useful for testing).
 */
export async function clearActivePlanId(userId: string): Promise<void> {
  await supabase
    .from("user_settings")
    .update({ active_plan_id: null })
    .eq("user_id", userId);
}
