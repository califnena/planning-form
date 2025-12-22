import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlanDataStatus {
  loading: boolean;
  userId: string | null;
  orgId: string | null;
  planId: string | null;
  hasAnyData: boolean;
  debugInfo: string | null;
  counts: {
    personalProfile: boolean;
    contacts: number;
    pets: number;
    insurance: number;
    properties: number;
    messages: number;
    planNotes: number;
  };
}

/**
 * Shared hook for checking if user has any planning data.
 * Uses auth-safe loading and fallback resolution for org/plan.
 */
export function usePlanDataStatus() {
  const [status, setStatus] = useState<PlanDataStatus>({
    loading: true,
    userId: null,
    orgId: null,
    planId: null,
    hasAnyData: false,
    debugInfo: null,
    counts: {
      personalProfile: false,
      contacts: 0,
      pets: 0,
      insurance: 0,
      properties: 0,
      messages: 0,
      planNotes: 0,
    },
  });

  useEffect(() => {
    const checkData = async () => {
      try {
        // Step 1: Wait for auth to load
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("[usePlanDataStatus] No authenticated user");
          setStatus(prev => ({ ...prev, loading: false, debugInfo: "No authenticated user" }));
          return;
        }

        console.log("[usePlanDataStatus] User ID:", user.id);
        let orgId: string | null = null;
        let planId: string | null = null;
        let debugInfo = "";

        // Step 2A: Primary - Try to get org from org_members
        const { data: orgMember, error: orgError } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (orgError) {
          console.log("[usePlanDataStatus] org_members query error:", orgError.message);
          debugInfo = `org_members error: ${orgError.message}`;
        }

        if (orgMember?.org_id) {
          orgId = orgMember.org_id;
          debugInfo = "Resolved org from org_members";
          console.log("[usePlanDataStatus] Found org from org_members:", orgId);

          // Get latest plan for this org
          const { data: plan } = await supabase
            .from("plans")
            .select("*")
            .eq("org_id", orgId)
            .eq("owner_user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (plan) {
            planId = plan.id;
            debugInfo += "; found plan by org";
          }
        }

        // Step 2B: Fallback - If no org or no plan, try to get plan directly by owner_user_id
        if (!planId) {
          console.log("[usePlanDataStatus] Trying fallback: plans by owner_user_id");
          const { data: fallbackPlan, error: fallbackError } = await supabase
            .from("plans")
            .select("*")
            .eq("owner_user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fallbackError) {
            console.log("[usePlanDataStatus] Fallback plan query error:", fallbackError.message);
            debugInfo += `; fallback error: ${fallbackError.message}`;
          }

          if (fallbackPlan) {
            planId = fallbackPlan.id;
            orgId = fallbackPlan.org_id || orgId;
            debugInfo = "Resolved plan via fallback (owner_user_id)";
            console.log("[usePlanDataStatus] Fallback found plan:", planId, "org:", orgId);
          }
        }

        // If still no plan, set status and return
        if (!planId) {
          console.log("[usePlanDataStatus] No plan found for user");
          setStatus(prev => ({
            ...prev,
            loading: false,
            userId: user.id,
            orgId,
            planId: null,
            debugInfo: debugInfo || "No plan found for user",
          }));
          return;
        }

        // Step 3: Check related tables for data
        const [
          { data: profile },
          { data: contacts },
          { data: pets },
          { data: insurance },
          { data: properties },
          { data: messages },
          { data: plan }
        ] = await Promise.all([
          supabase.from("personal_profiles").select("full_name").eq("plan_id", planId).maybeSingle(),
          supabase.from("contacts_notify").select("id").eq("plan_id", planId),
          supabase.from("pets").select("id").eq("plan_id", planId),
          supabase.from("insurance_policies").select("id").eq("plan_id", planId),
          supabase.from("properties").select("id").eq("plan_id", planId),
          supabase.from("messages").select("id").eq("plan_id", planId),
          supabase.from("plans").select("*").eq("id", planId).maybeSingle()
        ]);

        // Count plan notes that have content
        const noteFields = [
          'instructions_notes', 'about_me_notes', 'checklist_notes',
          'funeral_wishes_notes', 'financial_notes', 'insurance_notes',
          'property_notes', 'pets_notes', 'digital_notes', 'legal_notes',
          'messages_notes', 'to_loved_ones_message'
        ];
        const planNotesCount = plan ? noteFields.filter(
          field => plan[field] && String(plan[field]).trim().length > 0
        ).length : 0;

        const counts = {
          personalProfile: !!profile?.full_name,
          contacts: contacts?.length || 0,
          pets: pets?.length || 0,
          insurance: insurance?.length || 0,
          properties: properties?.length || 0,
          messages: messages?.length || 0,
          planNotes: planNotesCount,
        };

        // Has data if ANY of these are true
        const hasAnyData =
          counts.personalProfile ||
          counts.contacts > 0 ||
          counts.pets > 0 ||
          counts.insurance > 0 ||
          counts.properties > 0 ||
          counts.messages > 0 ||
          counts.planNotes > 0;

        console.log("[usePlanDataStatus] Counts:", counts, "hasAnyData:", hasAnyData);

        setStatus({
          loading: false,
          userId: user.id,
          orgId,
          planId,
          hasAnyData,
          debugInfo,
          counts,
        });
      } catch (error) {
        console.error("[usePlanDataStatus] Error:", error);
        setStatus(prev => ({ ...prev, loading: false, debugInfo: `Error: ${error}` }));
      }
    };

    checkData();
  }, []);

  return status;
}
