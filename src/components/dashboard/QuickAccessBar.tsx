import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save, Eye, CheckCircle, Headset } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QuickAccessBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    // Trigger save - this would normally save current plan state
    toast({
      title: "Progress saved",
      description: "Your work has been saved successfully.",
    });
  };

  const handlePreview = () => {
    navigate("/app");
  };

  const handleChecklist = () => {
    navigate("/next-steps");
  };

  const handleVIPCoach = () => {
    navigate("/vip-coach");
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save My Progress
          </Button>
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview My Planner
          </Button>
          <Button
            onClick={handleChecklist}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            After-Death Checklist
          </Button>
          <Button
            onClick={handleVIPCoach}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Headset className="h-4 w-4" />
            VIP Coach Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};
