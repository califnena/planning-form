import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkPaidAccess } from "@/lib/accessChecks";
import { PlannerModeModal } from "@/components/planner/PlannerModeModal";

/**
 * Single entry point for the planner.
 * Handles: auth check, paid access check, mode selection, and routing.
 * NEVER redirects to /profile or logs out users.
 */
export default function PlannerStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializePlanner = async () => {
      try {
        // Step 1: Auth check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Save return URL and redirect to login
          localStorage.setItem("efa_last_visited_route", "/planner/start");
          navigate("/login", { replace: true });
          return;
        }

        setUserId(session.user.id);

        // Step 2: Paid access check
        const hasPaidAccess = await checkPaidAccess();
        if (!hasPaidAccess) {
          navigate("/pricing", { replace: true });
          return;
        }

        // Step 3: Load user settings
        const { data: settings } = await supabase
          .from("user_settings")
          .select("planner_mode, selected_sections, last_step_index")
          .eq("user_id", session.user.id)
          .maybeSingle();

        // Step 4: Check planner mode
        if (!settings?.planner_mode) {
          setShowModeModal(true);
          setIsLoading(false);
          return;
        }

        // Step 5: Check if sections are selected
        if (!settings?.selected_sections || settings.selected_sections.length === 0) {
          navigate("/preferences", { replace: true });
          return;
        }

        // Step 6: Route based on mode
        if (settings.planner_mode === 'guided') {
          navigate("/wizard/preplanning", { replace: true });
        } else {
          navigate("/preplansteps", { replace: true });
        }
      } catch (error) {
        console.error("Error initializing planner:", error);
        // On error, try to continue to planner without losing user
        navigate("/preplansteps", { replace: true });
      }
    };

    initializePlanner();
  }, [navigate]);

  const handleModeSelected = async (mode: 'guided' | 'free') => {
    setShowModeModal(false);
    setIsLoading(true);

    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Save the mode
      await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          planner_mode: mode
        }, { onConflict: 'user_id' });

      // Check if sections are selected
      const { data: settings } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", userId)
        .maybeSingle();

      if (!settings?.selected_sections || settings.selected_sections.length === 0) {
        navigate("/preferences", { replace: true });
        return;
      }

      // Route based on mode
      if (mode === 'guided') {
        navigate("/wizard/preplanning", { replace: true });
      } else {
        navigate("/preplansteps", { replace: true });
      }
    } catch (error) {
      console.error("Error saving mode:", error);
      // On error, proceed to free mode
      navigate("/preplansteps", { replace: true });
    }
  };

  if (showModeModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PlannerModeModal
          open={true}
          onOpenChange={(open) => {
            if (!open) navigate("/dashboard", { replace: true });
          }}
          onContinue={handleModeSelected}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Preparing your planner...</p>
      </div>
    </div>
  );
}
