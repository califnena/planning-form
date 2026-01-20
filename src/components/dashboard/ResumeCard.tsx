import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isValid, parseISO, formatDistanceToNow } from "date-fns";

interface PlannerProgress {
  lastActivity: string | null;
  currentStep: number;
  totalSteps: number;
  completedSections: string[];
  plannerMode: string | null;
}

export const ResumeCard = () => {
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

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Your Planning Progress
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
          
          {/* Progress info without bar or percentage - simplified for emotional safety */}
          <div className="text-xs text-muted-foreground">
            <span>{progress.completedSections.length} of {progress.totalSteps} sections completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
