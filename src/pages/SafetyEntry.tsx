import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SafetyEntry() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChoice = async (path: "planning_ahead" | "after_loss") => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, store choice in sessionStorage and continue
        sessionStorage.setItem("efa_emotional_path", path);
        navigate("/orientation");
        return;
      }

      // Save emotional_path and mark onboarding complete
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          emotional_path: path,
          efa_onboarding_complete: true,
        }, { onConflict: "user_id" });

      if (error) throw error;

      navigate("/orientation");
    } catch (error) {
      console.error("Error saving path choice:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
          Let's take this one step at a time.
        </h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          Most people feel unsure where to begin.<br />
          We'll take this one step at a time.<br />
          You can pause, stop, or come back anytime.
        </p>

        <div className="flex flex-col gap-4 pt-4">
          <Button
            size="lg"
            className="min-h-[52px] text-lg"
            onClick={() => handleChoice("planning_ahead")}
            disabled={isLoading}
          >
            I'm planning ahead
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="min-h-[52px] text-lg"
            onClick={() => handleChoice("after_loss")}
            disabled={isLoading}
          >
            Someone has passed or will soon
          </Button>
        </div>
      </div>
    </div>
  );
}
