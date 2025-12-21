import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PlannerModeModal } from "@/components/planner/PlannerModeModal";

/**
 * Single entry point for the planner.
 * Guard order:
 *  1) Auth session
 *  2) Paid access (subscription)
 *  3) Mode selection
 *  4) Route into planner
 */
export default function PlannerStart() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializePlanner = async () => {
      try {
        // 1) Auth check
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Login should bounce straight back here
          localStorage.setItem("efa_last_visited_route", "/planner/start");
          navigate("/login?redirect=/planner/start", { replace: true });
          return;
        }

        setUserId(session.user.id);

        // 2) Paid access check (subscription-based; never send paid users to login)
        const { data: isAdmin } = await supabase.rpc("has_app_role", {
          _user_id: session.user.id,
          _role: "admin",
        });

        let hasPaidAccess = !!isAdmin;

        if (!hasPaidAccess) {
          const { data: planType, error: planError } = await supabase.rpc("get_user_subscription", {
            _user_id: session.user.id,
          });

          if (!planError) {
            hasPaidAccess = !!planType && planType !== "free";
          }
        }

        if (!hasPaidAccess) {
          navigate("/pricing", { replace: true });
          return;
        }

        // 3) Load user settings
        const { data: settings } = await supabase
          .from("user_settings")
          .select("planner_mode, selected_sections")
          .eq("user_id", session.user.id)
          .maybeSingle();

        // 4) Mode choice if not set
        if (!settings?.planner_mode) {
          setShowModeModal(true);
          setIsLoading(false);
          return;
        }

        // 5) Must have selected sections
        if (!settings?.selected_sections || settings.selected_sections.length === 0) {
          navigate("/preferences", { replace: true });
          return;
        }

        // 6) Route into planner (resume handled inside wizard/planner pages)
        if (settings.planner_mode === "guided") {
          navigate("/wizard/preplanning", { replace: true });
        } else {
          navigate("/preplansteps", { replace: true });
        }
      } catch (error) {
        console.error("Error initializing planner:", error);
        // Fail open into the planner app if something non-auth breaks
        navigate("/preplansteps", { replace: true });
      }
    };

    initializePlanner();
  }, [navigate]);

  const handleModeSelected = async (mode: "guided" | "free") => {
    setShowModeModal(false);
    setIsLoading(true);

    if (!userId) {
      navigate("/login?redirect=/planner/start", { replace: true });
      return;
    }

    try {
      await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            planner_mode: mode,
          },
          { onConflict: "user_id" }
        );

      const { data: settings } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", userId)
        .maybeSingle();

      if (!settings?.selected_sections || settings.selected_sections.length === 0) {
        navigate("/preferences", { replace: true });
        return;
      }

      if (mode === "guided") {
        navigate("/wizard/preplanning", { replace: true });
      } else {
        navigate("/preplansteps", { replace: true });
      }
    } catch (error) {
      console.error("Error saving mode:", error);
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
        <p className="text-muted-foreground">
          {isLoading ? "Preparing your planner..." : ""}
        </p>
      </div>
    </div>
  );
}

