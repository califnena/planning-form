/**
 * Hook to detect when a user has completed all planning sections.
 * Used by Claire to trigger end-of-planning congratulations.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCompletableSections } from "@/lib/sectionRegistry";
import { getSectionCompletion } from "@/lib/sectionCompletion";
import { getActivePlanId } from "@/lib/getActivePlanId";

interface PlanningCompletionStatus {
  isComplete: boolean;
  completedCount: number;
  totalSections: number;
  isLoading: boolean;
}

export function usePlanningCompletion(): PlanningCompletionStatus {
  const [status, setStatus] = useState<PlanningCompletionStatus>({
    isComplete: false,
    completedCount: 0,
    totalSections: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function checkCompletion() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus({
            isComplete: false,
            completedCount: 0,
            totalSections: getCompletableSections().length,
            isLoading: false,
          });
          return;
        }

        const { planId, plan } = await getActivePlanId(user.id);
        if (!planId || !plan) {
          setStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Get completion status for all sections
        const completion = getSectionCompletion(plan);
        const completableSections = getCompletableSections();
        
        const completedCount = Object.values(completion).filter(Boolean).length;
        const totalSections = completableSections.length;
        
        // Consider "complete" when at least 80% of sections are done
        // This accounts for optional sections like pets, travel, etc.
        const completionThreshold = 0.8;
        const isComplete = completedCount / totalSections >= completionThreshold;

        setStatus({
          isComplete,
          completedCount,
          totalSections,
          isLoading: false,
        });
      } catch (err) {
        console.error("[usePlanningCompletion] Error:", err);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    }

    checkCompletion();
  }, []);

  return status;
}
