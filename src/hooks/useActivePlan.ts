import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getActivePlanId } from "@/lib/getActivePlanId";

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
 * Uses the centralized getActivePlanId function to ensure consistency.
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

        // Step 2: Use centralized getActivePlanId (createIfMissing = true)
        const { planId, orgId, plan } = await getActivePlanId(user.id, true);

        if (!planId) {
          console.log("[useActivePlan] No plan found or created");
          setState({ loading: false, planId: null, orgId: null, plan: null, error: "No plan available" });
          return;
        }

        console.log("[useActivePlan] Resolved plan:", planId);
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
