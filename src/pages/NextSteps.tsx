import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function NextSteps() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    redirectToCase();
  }, []);

  const redirectToCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check for existing cases
      const { data: cases, error } = await supabase
        .from("cases")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      // If case exists, redirect to it
      if (cases && cases.length > 0) {
        navigate(`/next-steps/case/${cases[0].id}`, { replace: true });
      } else {
        // Create new case and redirect
        const { data: newCase, error: createError } = await supabase
          .from("cases")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;

        navigate(`/next-steps/case/${newCase.id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: t("common.error"),
        description: t("afterDeathSteps.errorLoadingPlan"),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">{t("afterDeathSteps.loadingPlanner")}</p>
    </div>
  );
}
