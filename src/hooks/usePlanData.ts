import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

export interface PlanData {
  id?: string;
  org_id?: string;
  title?: string;
  prepared_for?: string;
  preparer_name?: string;
  prepared_by?: string;
  to_loved_ones_message?: string;
  instructions_notes?: string;
  about_me_notes?: string;
  checklist_notes?: string;
  funeral_wishes_notes?: string;
  financial_notes?: string;
  insurance_notes?: string;
  property_notes?: string;
  pets_notes?: string;
  digital_notes?: string;
  legal_notes?: string;
  messages_notes?: string;
  revisions?: Array<{
    revision_date: string;
    signature_png: string;
    prepared_by: string;
  }>;
}

export const usePlanData = (userId: string) => {
  const [plan, setPlan] = useState<PlanData>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load plan from Supabase
  useEffect(() => {
    const loadPlan = async () => {
      try {
        // Get user's org
        const { data: orgMember } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .eq("role", "owner")
          .single();

        if (!orgMember) {
          setLoading(false);
          return;
        }

        // Get or create plan
        const { data: existingPlan } = await supabase
          .from("plans")
          .select("*")
          .eq("org_id", orgMember.org_id)
          .eq("owner_user_id", userId)
          .maybeSingle();

        if (existingPlan) {
          setPlan(existingPlan);
          // Merge with localStorage if newer
          const localData = localStorage.getItem(`plan_${userId}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            const localTime = new Date(parsed.updated_at || 0);
            const serverTime = new Date(existingPlan.updated_at || 0);
            if (localTime > serverTime) {
              setPlan(parsed);
            }
          }
        } else {
          // Create new plan
          const { data: newPlan, error } = await supabase
            .from("plans")
            .insert({
              org_id: orgMember.org_id,
              owner_user_id: userId,
              title: "My Final Wishes Plan",
            })
            .select()
            .single();

          if (error) throw error;
          setPlan(newPlan);
        }
      } catch (error: any) {
        console.error("Error loading plan:", error);
        toast({
          title: "Error loading plan",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [userId, toast]);

  // Debounced save to Supabase
  const saveToDB = useCallback(
    debounce(async (data: PlanData) => {
      if (!data.id) return;

      try {
        const { error } = await supabase
          .from("plans")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        if (error) throw error;
      } catch (error: any) {
        console.error("Error saving to DB:", error);
      }
    }, 800),
    []
  );

  // Update plan (saves to localStorage immediately, DB after debounce)
  const updatePlan = useCallback(
    (updates: Partial<PlanData>) => {
      setPlan((prev) => {
        const updated = { ...prev, ...updates };
        // Save to localStorage immediately
        localStorage.setItem(`plan_${userId}`, JSON.stringify(updated));
        // Debounced save to DB
        saveToDB(updated);
        return updated;
      });
    },
    [userId, saveToDB]
  );

  return { plan, loading, updatePlan };
};
