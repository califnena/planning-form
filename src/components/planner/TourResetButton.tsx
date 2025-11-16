import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TourResetButtonProps {
  userId: string;
  onReset?: () => void;
}

export const TourResetButton = ({ userId, onReset }: TourResetButtonProps) => {
  const { toast } = useToast();

  const handleReset = async () => {
    try {
      await supabase
        .from("user_settings")
        .update({
          wizard_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      toast({
        title: "Tour Reset",
        description: "Refresh the page to see the guided tour again.",
      });

      onReset?.();
      
      // Refresh page to show tour
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error resetting tour:", error);
      toast({
        title: "Error",
        description: "Failed to reset the tour. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Restart Guided Tour
    </Button>
  );
};
