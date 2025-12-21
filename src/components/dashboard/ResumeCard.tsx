import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";

interface PlannerProgress {
  lastActivity: string | null;
  currentStep: number;
  totalSteps: number;
  completedSections: string[];
  plannerMode: string | null;
}

export const ResumeCard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<PlannerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: settings } = await supabase
          .from("user_settings")
          .select("last_planner_activity, selected_sections, planner_mode, last_step_index, completed_sections")
          .eq("user_id", user.id)
          .maybeSingle();

        // Cast to any to access dynamic columns
        const settingsData = settings as { 
          last_planner_activity?: string;
          selected_sections?: string[];
          planner_mode?: string;
          last_step_index?: number;
          completed_sections?: string[];
        } | null;

        if (settingsData?.selected_sections && settingsData.selected_sections.length > 0) {
          let formattedDate = null;
          if (settingsData.last_planner_activity) {
            const date = parseISO(settingsData.last_planner_activity);
            if (isValid(date)) {
              formattedDate = formatDistanceToNow(date, { addSuffix: true });
            }
          }

          setProgress({
            lastActivity: formattedDate,
            currentStep: (settingsData.last_step_index ?? 0) + 1,
            totalSteps: settingsData.selected_sections.length,
            completedSections: settingsData.completed_sections ?? [],
            plannerMode: settingsData.planner_mode ?? null
          });
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (isLoading || !progress) {
    return null;
  }

  const progressPercent = progress.totalSteps > 0 
    ? Math.round((progress.completedSections.length / progress.totalSteps) * 100) 
    : 0;

  const handleContinue = () => {
    // Navigate based on planner mode
    if (progress.plannerMode === 'guided') {
      navigate('/wizard/preplanning');
    } else {
      navigate('/preplansteps');
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Continue where you left off
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Step {progress.currentStep} of {progress.totalSteps}
                  {progress.lastActivity && (
                    <span className="ml-2 text-muted-foreground/70">
                      · Last updated {progress.lastActivity}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleContinue}
              className="flex-shrink-0"
            >
              Continue Planning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.completedSections.length} of {progress.totalSteps} sections completed</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
