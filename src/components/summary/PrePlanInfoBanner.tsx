import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrePlanInfoBannerProps {
  onUseInfo?: () => void;
}

export function PrePlanInfoBanner({ onUseInfo }: PrePlanInfoBannerProps) {
  const navigate = useNavigate();
  const [hasPlan, setHasPlan] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForPlan();
  }, []);

  const checkForPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's org and plan
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (orgMember) {
        const { data: plan } = await supabase
          .from("plans")
          .select("prepared_for, percent_complete")
          .eq("org_id", orgMember.org_id)
          .eq("owner_user_id", user.id)
          .maybeSingle();

        if (plan && (plan.percent_complete || 0) > 0) {
          setHasPlan(true);
          setPlanName(plan.prepared_for || null);
        }
      }
    } catch (error) {
      console.error("Error checking for plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hasPlan) {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            Pre-Planning Information Available
          </h3>
          <p className="text-muted-foreground mb-4">
            {planName ? `Planning information for ${planName} was already created earlier.` : 'Planning information was already created earlier.'}
            {' '}You can review or use it as a reference now.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate("/preplan-summary")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Pre-Planning Summary
            </Button>
            {onUseInfo && (
              <Button onClick={onUseInfo}>
                Use This Information to Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            You can change or update anything at any time.
          </p>
        </div>
      </div>
    </Card>
  );
}
