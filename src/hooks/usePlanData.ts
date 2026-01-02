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
  plan_payload?: Record<string, any>;
  revisions?: Array<{
    revision_date: string;
    signature_png: string;
    prepared_by: string;
  }>;
  // Allow nested objects and additional properties (these go into plan_payload)
  [key: string]: any;
}

export interface SaveState {
  saving: boolean;
  lastSaved: Date | null;
  error: boolean;
}

// Known columns in the plans table that can be saved directly
const PLAN_TABLE_COLUMNS = new Set([
  'id',
  'org_id',
  'owner_user_id',
  'title',
  'last_signed_at',
  'prepared_for',
  'preparer_name',
  'last_updated_date',
  'to_loved_ones_message',
  'instructions_notes',
  'about_me_notes',
  'checklist_notes',
  'funeral_wishes_notes',
  'financial_notes',
  'insurance_notes',
  'property_notes',
  'pets_notes',
  'digital_notes',
  'legal_notes',
  'messages_notes',
  'percent_complete',
  'created_at',
  'updated_at',
  'plan_payload',
]);

// Section data keys that should be stored in plan_payload
const SECTION_DATA_KEYS = new Set([
  'funeral',
  'financial',
  'insurance',
  'property',
  'pets',
  'digital',
  'messages',
  'contacts',
  'healthcare',
  'care_preferences',
  'advance_directive',
  'travel',
  'preplanning',
  'personal',
  'about_you',
  'legal',
  'legacy',
]);

/**
 * Separates plan data into table columns and payload sections.
 * Section data gets merged into plan_payload.
 */
function separatePlanData(data: PlanData): { tableData: Record<string, any>; payload: Record<string, any> } {
  const tableData: Record<string, any> = {};
  const payload: Record<string, any> = { ...(data.plan_payload || {}) };

  for (const [key, value] of Object.entries(data)) {
    if (key === 'plan_payload') {
      // Already handled above
      continue;
    } else if (PLAN_TABLE_COLUMNS.has(key)) {
      // Known table column
      tableData[key] = value;
    } else if (SECTION_DATA_KEYS.has(key) || typeof value === 'object') {
      // Section data - merge into payload
      if (value !== undefined && value !== null) {
        payload[key] = value;
      }
    }
    // Other unknown primitive values are ignored
  }

  return { tableData, payload };
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
        // Separate table columns from section data
        const { tableData, payload } = separatePlanData(data);

        // Build the update object with only valid columns
        const updateData: Record<string, any> = {
          ...tableData,
          plan_payload: payload,
          updated_at: new Date().toISOString(),
        };

        // Remove id from update (it's used in the WHERE clause)
        delete updateData.id;

        if (import.meta.env.DEV) {
          console.log("[usePlanData] Saving to DB:", {
            planId: data.id,
            tableDataKeys: Object.keys(tableData),
            payloadKeys: Object.keys(payload),
          });
        }

        const { error } = await supabase
          .from("plans")
          .update(updateData)
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
          // Merge plan_payload back into the plan object for easy access
          const payloadData = (typeof existingPlan.plan_payload === 'object' && existingPlan.plan_payload !== null) 
            ? existingPlan.plan_payload as Record<string, any>
            : {};
          const mergedPlan: PlanData = {
            ...existingPlan,
            ...payloadData,
            plan_payload: payloadData, // Ensure correct type
          };

          // Merge server data with local data, preferring newer data
          if (localData) {
            const parsed = JSON.parse(localData) as PlanData;
            const localTime = new Date(parsed.updated_at || 0);
            const serverTime = new Date(existingPlan.updated_at || 0);
            if (localTime > serverTime) {
              // Local is newer, sync to server
              setPlan(parsed);
              saveToDB(parsed);
            } else {
              // Server is newer, use server data
              setPlan(mergedPlan);
              localStorage.setItem(`plan_${userId}`, JSON.stringify(mergedPlan));
            }
          } else {
            setPlan(mergedPlan);
            localStorage.setItem(`plan_${userId}`, JSON.stringify(mergedPlan));
          }
        } else {
          // Create new plan in database
          const planData = localData ? JSON.parse(localData) : {
            title: "My Final Wishes Plan",
          };

          // Separate table data from section data for initial insert
          const { tableData, payload } = separatePlanData(planData);

          const { data: newPlan, error: createError } = await supabase
            .from("plans")
            .insert({
              org_id: orgMember.org_id,
              owner_user_id: userId,
              ...tableData,
              plan_payload: payload,
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
            const payloadData = (typeof newPlan.plan_payload === 'object' && newPlan.plan_payload !== null)
              ? newPlan.plan_payload as Record<string, any>
              : {};
            const mergedPlan: PlanData = {
              ...newPlan,
              ...payloadData,
              plan_payload: payloadData, // Ensure correct type
            };
            setPlan(mergedPlan);
            localStorage.setItem(`plan_${userId}`, JSON.stringify(mergedPlan));
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
