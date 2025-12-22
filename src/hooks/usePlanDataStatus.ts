import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActivePlan, fetchPlanData } from "@/hooks/useActivePlan";

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
 * Uses the unified useActivePlan hook as the single source of truth for plan_id.
 */
export function usePlanDataStatus() {
  const { loading: planLoading, planId, orgId, plan, error: planError } = useActivePlan();
  
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
      // Wait for plan resolution to complete
      if (planLoading) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("[usePlanDataStatus] No authenticated user");
          setStatus(prev => ({ ...prev, loading: false, debugInfo: "No authenticated user" }));
          return;
        }

        // If no plan found, return early
        if (!planId) {
          console.log("[usePlanDataStatus] No plan found for user");
          setStatus(prev => ({
            ...prev,
            loading: false,
            userId: user.id,
            orgId,
            planId: null,
            debugInfo: planError || "No plan found for user",
          }));
          return;
        }

        console.log("[usePlanDataStatus] Using planId from useActivePlan:", planId);

        // Fetch plan data using the unified function
        const data = await fetchPlanData(planId);

        // Count plan notes that have content
        const noteFields = [
          'instructions_notes', 'about_me_notes', 'checklist_notes',
          'funeral_wishes_notes', 'financial_notes', 'insurance_notes',
          'property_notes', 'pets_notes', 'digital_notes', 'legal_notes',
          'messages_notes', 'to_loved_ones_message'
        ];
        const planNotesCount = data.plan ? noteFields.filter(
          field => data.plan[field] && String(data.plan[field]).trim().length > 0
        ).length : 0;

        const counts = {
          personalProfile: !!data.personalProfile?.full_name,
          contacts: data.contacts?.length || 0,
          pets: data.pets?.length || 0,
          insurance: data.insurance?.length || 0,
          properties: data.properties?.length || 0,
          messages: data.messages?.length || 0,
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
          debugInfo: "Resolved via useActivePlan",
          counts,
        });
      } catch (error) {
        console.error("[usePlanDataStatus] Error:", error);
        setStatus(prev => ({ ...prev, loading: false, debugInfo: `Error: ${error}` }));
      }
    };

    checkData();
  }, [planLoading, planId, orgId, planError, plan]);

  return status;
}
