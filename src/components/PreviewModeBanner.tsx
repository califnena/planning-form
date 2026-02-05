import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PreviewModeBanner = () => {
  const navigate = useNavigate();
  
  return (
    <Alert className="mb-6 border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 shadow-sm">
      <Eye className="h-6 w-6 text-primary" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <AlertTitle className="text-foreground font-semibold text-lg">
            You're in preview mode
          </AlertTitle>
          <AlertDescription className="text-muted-foreground mt-1">
            Look through the planner and see how it works. Choose a plan when you're ready.
          </AlertDescription>
        </div>
        <Button 
          onClick={() => navigate("/pricing")}
          variant="outline"
          className="whitespace-nowrap border-primary/30 text-primary hover:bg-primary/5"
        >
          Choose a Plan
        </Button>
      </div>
    </Alert>
  );
};
