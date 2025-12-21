import { useState, useEffect, useCallback, useRef } from "react";
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

export interface SaveState {
  saving: boolean;
  lastSaved: Date | null;
  error: boolean;
}

export const usePlanData = (userId: string) => {
  const [plan, setPlan] = useState<PlanData>({});
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>({
    saving: false,
    lastSaved: null,
    error: false
  });
  const { toast } = useToast();
  const saveInProgressRef = useRef(false);

  // Debounced save to Supabase
  const saveToDB = useCallback(
    debounce(async (data: PlanData) => {
      if (!data.id) return;

      saveInProgressRef.current = true;
      setSaveState(prev => ({ ...prev, saving: true, error: false }));

      try {
        const { error } = await supabase
          .from("plans")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        if (error) throw error;
        
        setSaveState({
          saving: false,
          lastSaved: new Date(),
          error: false
        });

        // Also update last_planner_activity
        await supabase
          .from("user_settings")
          .upsert({
            user_id: userId,
            last_planner_activity: new Date().toISOString()
          }, { onConflict: 'user_id' });

      } catch (error: any) {
        console.error("Error saving to DB:", error);
        setSaveState(prev => ({ ...prev, saving: false, error: true }));
      } finally {
        saveInProgressRef.current = false;
      }
    }, 800),
    [userId]
  );

  // Load plan from Supabase
  useEffect(() => {
    const loadPlan = async () => {
      try {
        // First, try to load from localStorage
        const localData = localStorage.getItem(`plan_${userId}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setPlan(parsed);
          } catch (e) {
            console.error("Error parsing localStorage:", e);
          }
        }

        // Get user's org - use maybeSingle to avoid errors
        const { data: orgMember, error: orgError } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .eq("role", "owner")
          .maybeSingle();

        if (orgError) {
          console.error("Error fetching org member:", orgError);
          setLoading(false);
          return;
        }

        if (!orgMember) {
          console.log("No org found for user, data will be stored locally only");
          setLoading(false);
          return;
        }

        // Get or create plan
        const { data: existingPlan, error: planError } = await supabase
          .from("plans")
          .select("*")
          .eq("org_id", orgMember.org_id)
          .eq("owner_user_id", userId)
          .maybeSingle();

        if (planError) {
          console.error("Error fetching plan:", planError);
          setLoading(false);
          return;
        }

        if (existingPlan) {
          // Merge server data with local data, preferring newer data
          if (localData) {
            const parsed = JSON.parse(localData);
            const localTime = new Date(parsed.updated_at || 0);
            const serverTime = new Date(existingPlan.updated_at || 0);
            if (localTime > serverTime) {
              // Local is newer, sync to server
              setPlan(parsed);
              saveToDB(parsed);
            } else {
              // Server is newer, use server data
              setPlan(existingPlan);
              localStorage.setItem(`plan_${userId}`, JSON.stringify(existingPlan));
            }
          } else {
            setPlan(existingPlan);
            localStorage.setItem(`plan_${userId}`, JSON.stringify(existingPlan));
          }
        } else {
          // Create new plan in database
          const planData = localData ? JSON.parse(localData) : {
            title: "My Final Wishes Plan",
          };

          const { data: newPlan, error: createError } = await supabase
            .from("plans")
            .insert({
              org_id: orgMember.org_id,
              owner_user_id: userId,
              ...planData,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating plan:", createError);
            // Plan creation failed, but we have local data
            setLoading(false);
            return;
          }

          if (newPlan) {
            setPlan(newPlan);
            localStorage.setItem(`plan_${userId}`, JSON.stringify(newPlan));
          }
        }
      } catch (error: any) {
        console.error("Error loading plan:", error);
        // Don't show error toast if we have local data
        const localData = localStorage.getItem(`plan_${userId}`);
        if (!localData) {
          toast({
            title: "Note",
            description: "Working in offline mode. Your data is saved locally.",
            variant: "default",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPlan();
    }
  }, [userId, toast, saveToDB]);

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

  return { plan, loading, updatePlan, saveState };
};
