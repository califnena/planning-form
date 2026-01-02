import { usePlanContext } from "./PlannerLayout";
import { SectionPrePlanning } from "@/components/planner/sections/SectionPrePlanning";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { ViewDocumentButton } from "@/components/planner/ViewDocumentButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PrePlanningPage() {
  const { user, saveState } = usePlanContext();
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, "completed" | "not_started">>({});

  // Load statuses from localStorage (persisted per user)
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`preplanning_statuses_${user.id}`);
      if (stored) {
        try {
          setStatuses(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing preplanning statuses:", e);
        }
      }
    }
  }, [user?.id]);

  const handleStatusChange = (id: string, status: "completed" | "not_started") => {
    const newStatuses = { ...statuses, [id]: status };
    setStatuses(newStatuses);
    
    // Persist to localStorage
    if (user?.id) {
      localStorage.setItem(`preplanning_statuses_${user.id}`, JSON.stringify(newStatuses));
    }

    toast({
      title: "Status updated",
      description: "Your progress has been saved.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      <ViewDocumentButton />
      <SectionPrePlanning 
        statuses={statuses}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
