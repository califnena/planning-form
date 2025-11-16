import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const ProgressOverview = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (!orgMember) return;

      // Get plan progress
      const { data: plan } = await supabase
        .from("plans")
        .select("percent_complete")
        .eq("org_id", orgMember.org_id)
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (plan?.percent_complete) {
        setProgress(plan.percent_complete);
      }
    };

    loadProgress();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Pre-Planning Progress</CardTitle>
        <p className="text-sm text-muted-foreground">You can stop and return at any time.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">{progress}%</span>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};
