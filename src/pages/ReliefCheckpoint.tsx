// Emotional flow pages: do not add pricing, progress bars, or extra choices here. Keep calm and simple.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getActivePlanId } from "@/lib/getActivePlanId";
import { CheckCircle2 } from "lucide-react";

interface CompletedItem {
  label: string;
  value: string;
}

export default function ReliefCheckpoint() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompletedItems = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const result = await getActivePlanId(user.id);
        if (!result.planId) {
          setIsLoading(false);
          return;
        }

        const { data: plan } = await supabase
          .from("plans")
          .select("plan_payload")
          .eq("id", result.planId)
          .single();

        if (!plan?.plan_payload) {
          setIsLoading(false);
          return;
        }

        const payload = plan.plan_payload as Record<string, any>;
        const items: CompletedItem[] = [];

        // Check for completed guided action items
        if (payload.personal_information?.preferred_name) {
          items.push({
            label: "Your preferred name",
            value: payload.personal_information.preferred_name,
          });
        }

        if (payload.funeral?.disposition) {
          const dispositionLabels: Record<string, string> = {
            burial: "Burial",
            cremation: "Cremation",
            undecided: "Still deciding",
          };
          items.push({
            label: "Disposition preference",
            value: dispositionLabels[payload.funeral.disposition] || payload.funeral.disposition,
          });
        }

        if (payload.contacts?.emergency_contact_name) {
          items.push({
            label: "Emergency contact",
            value: payload.contacts.emergency_contact_name,
          });
        }

        // Check for any additional meaningful data
        if (payload.personal_information?.full_name) {
          items.push({
            label: "Your full name",
            value: payload.personal_information.full_name,
          });
        }

        setCompletedItems(items);
      } catch (error) {
        console.error("Error loading completed items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedItems();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center leading-tight">
          You've already taken care of important things.
        </h1>

        {completedItems.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            {completedItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-base text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-lg text-muted-foreground text-center">
          It's okay to pause here.<br />
          Everything you've done is saved.
        </p>

        <div className="space-y-4 pt-4">
          <Button
            size="lg"
            className="min-h-[52px] text-lg w-full"
            onClick={() => navigate("/guided-action")}
          >
            Continue when you're ready
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="min-h-[52px] text-lg w-full"
            onClick={() => navigate("/dashboard")}
          >
            Take a break
          </Button>
        </div>
      </div>
    </div>
  );
}
