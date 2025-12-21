import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlanDataStatus {
  loading: boolean;
  orgId: string | null;
  planId: string | null;
  hasAnyData: boolean;
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
 * Uses the same logic for Dashboard and PrePlanSummary.
 */
export function usePlanDataStatus() {
  const [status, setStatus] = useState<PlanDataStatus>({
    loading: true,
    orgId: null,
    planId: null,
    hasAnyData: false,
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus(prev => ({ ...prev, loading: false }));
          return;
        }

        // Step 1: Get user's org
        const { data: orgMember } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", user.id)
          .eq("role", "owner")
          .maybeSingle();

        if (!orgMember) {
          setStatus(prev => ({ ...prev, loading: false, orgId: null, planId: null }));
          return;
        }

        // Step 2: Get latest plan
        const { data: plan } = await supabase
          .from("plans")
          .select("*")
          .eq("org_id", orgMember.org_id)
          .eq("owner_user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!plan) {
          setStatus(prev => ({ 
            ...prev, 
            loading: false, 
            orgId: orgMember.org_id, 
            planId: null 
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
          { data: messages }
        ] = await Promise.all([
          supabase.from("personal_profiles").select("full_name").eq("plan_id", plan.id).maybeSingle(),
          supabase.from("contacts_notify").select("id").eq("plan_id", plan.id),
          supabase.from("pets").select("id").eq("plan_id", plan.id),
          supabase.from("insurance_policies").select("id").eq("plan_id", plan.id),
          supabase.from("properties").select("id").eq("plan_id", plan.id),
          supabase.from("messages").select("id").eq("plan_id", plan.id)
        ]);

        // Count plan notes that have content
        const noteFields = [
          'instructions_notes', 'about_me_notes', 'checklist_notes', 
          'funeral_wishes_notes', 'financial_notes', 'insurance_notes', 
          'property_notes', 'pets_notes', 'digital_notes', 'legal_notes', 
          'messages_notes', 'to_loved_ones_message'
        ];
        const planNotesCount = noteFields.filter(
          field => plan[field] && String(plan[field]).trim().length > 0
        ).length;

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
          orgId: orgMember.org_id,
          planId: plan.id,
          hasAnyData,
          counts,
        });
      } catch (error) {
        console.error("[usePlanDataStatus] Error:", error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkData();
  }, []);

  return status;
}
