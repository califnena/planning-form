import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ActivePlanResult {
  loading: boolean;
  planId: string | null;
  orgId: string | null;
  plan: any | null;
  error: string | null;
}

/**
 * Unified hook for resolving the active plan for the current user.
 * This is the SINGLE SOURCE OF TRUTH for plan_id across the app.
 * 
 * Behavior:
 * 1. Finds the user's org from org_members
 * 2. Finds or creates a plan for that org
 * 3. NEVER returns null planId for an authenticated user
 */
export function useActivePlan(): ActivePlanResult {
  const [state, setState] = useState<ActivePlanResult>({
    loading: true,
    planId: null,
    orgId: null,
    plan: null,
    error: null,
  });

  useEffect(() => {
    const resolvePlan = async () => {
      try {
        // Step 1: Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log("[useActivePlan] No authenticated user");
          setState({ loading: false, planId: null, orgId: null, plan: null, error: "Not authenticated" });
          return;
        }

        console.log("[useActivePlan] Resolving plan for user:", user.id);
        let orgId: string | null = null;
        let planId: string | null = null;
        let plan: any | null = null;

        // Step 2: Try to get org from org_members
        const { data: orgMember, error: orgError } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (orgError) {
          console.log("[useActivePlan] org_members error:", orgError.message);
        }

        if (orgMember?.org_id) {
          orgId = orgMember.org_id;
          console.log("[useActivePlan] Found org:", orgId);

          // Try to get existing plan for this org
          const { data: existingPlan, error: planError } = await supabase
            .from("plans")
            .select("*")
            .eq("org_id", orgId)
            .eq("owner_user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!planError && existingPlan) {
            planId = existingPlan.id;
            plan = existingPlan;
            console.log("[useActivePlan] Found existing plan:", planId);
          }
        }

        // Step 3: Fallback - Try to find plan directly by owner_user_id
        if (!planId) {
          const { data: fallbackPlan, error: fallbackError } = await supabase
            .from("plans")
            .select("*")
            .eq("owner_user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!fallbackError && fallbackPlan) {
            planId = fallbackPlan.id;
            plan = fallbackPlan;
            orgId = fallbackPlan.org_id || orgId;
            console.log("[useActivePlan] Fallback found plan:", planId);
          }
        }

        // Step 4: If still no plan and we have an org, create one
        if (!planId && orgId) {
          console.log("[useActivePlan] Creating new plan for org:", orgId);
          
          // Get profile for prepared_for name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          const { data: newPlan, error: createError } = await supabase
            .from("plans")
            .insert({
              org_id: orgId,
              owner_user_id: user.id,
              title: "My Final Wishes Plan",
              prepared_for: profile?.full_name || null,
            })
            .select()
            .single();

          if (createError) {
            console.error("[useActivePlan] Failed to create plan:", createError);
            setState({ loading: false, planId: null, orgId, plan: null, error: createError.message });
            return;
          }

          planId = newPlan.id;
          plan = newPlan;
          console.log("[useActivePlan] Created new plan:", planId);
        }

        // Step 5: If we have neither org nor plan, we cannot proceed
        if (!planId) {
          console.log("[useActivePlan] No org or plan found - user may need onboarding");
          setState({ loading: false, planId: null, orgId: null, plan: null, error: "No plan available" });
          return;
        }

        setState({ loading: false, planId, orgId, plan, error: null });
      } catch (error: any) {
        console.error("[useActivePlan] Error:", error);
        setState({ loading: false, planId: null, orgId: null, plan: null, error: error.message });
      }
    };

    resolvePlan();
  }, []);

  return state;
}

/**
 * Fetches plan-related data from all relevant tables using the plan_id.
 * This ensures consistent data retrieval across the app.
 */
export async function fetchPlanData(planId: string) {
  const [
    { data: plan },
    { data: personalProfile },
    { data: contacts },
    { data: pets },
    { data: insurance },
    { data: properties },
    { data: messages },
    { data: investments },
    { data: debts },
    { data: bankAccounts },
    { data: businesses },
    { data: funeralFunding },
    { data: professionalContacts },
  ] = await Promise.all([
    supabase.from("plans").select("*").eq("id", planId).maybeSingle(),
    supabase.from("personal_profiles").select("*").eq("plan_id", planId).maybeSingle(),
    supabase.from("contacts_notify").select("*").eq("plan_id", planId),
    supabase.from("pets").select("*").eq("plan_id", planId),
    supabase.from("insurance_policies").select("*").eq("plan_id", planId),
    supabase.from("properties").select("*").eq("plan_id", planId),
    supabase.from("messages").select("*").eq("plan_id", planId),
    supabase.from("investments").select("*").eq("plan_id", planId),
    supabase.from("debts").select("*").eq("plan_id", planId),
    supabase.from("bank_accounts").select("*").eq("plan_id", planId),
    supabase.from("businesses").select("*").eq("plan_id", planId),
    supabase.from("funeral_funding").select("*").eq("plan_id", planId),
    supabase.from("contacts_professional").select("*").eq("plan_id", planId),
  ]);

  return {
    plan,
    personalProfile,
    contacts: contacts || [],
    pets: pets || [],
    insurance: insurance || [],
    properties: properties || [],
    messages: messages || [],
    investments: investments || [],
    debts: debts || [],
    bankAccounts: bankAccounts || [],
    businesses: businesses || [],
    funeralFunding: funeralFunding || [],
    professionalContacts: professionalContacts || [],
  };
}
