import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid, parseISO } from "date-fns";

export const ResumeCard = () => {
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLastActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: settings } = await supabase
          .from("user_settings")
          .select("last_planner_activity")
          .eq("user_id", user.id)
          .maybeSingle();

        // Cast to any to access dynamic column
        const settingsData = settings as { last_planner_activity?: string } | null;
        if (settingsData?.last_planner_activity) {
          const date = parseISO(settingsData.last_planner_activity);
          if (isValid(date)) {
            setLastActivity(format(date, "MMMM d, yyyy"));
          }
        }
      } catch (error) {
        console.error("Error fetching last activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastActivity();
  }, []);

  if (isLoading || !lastActivity) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Continue where you left off
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                You last worked on your plan on {lastActivity}.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/planner")}
            className="flex-shrink-0"
          >
            Continue Planning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
