import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PreviewModeBanner = () => {
  const navigate = useNavigate();
  
  return (
    <Alert className="mb-6 border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 shadow-md">
      <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <AlertTitle className="text-amber-900 dark:text-amber-200 font-bold text-lg">
            Read-Only Until You Subscribe
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300 font-medium mt-1">
            You are viewing this in read-only mode. Subscribe to edit and save your plan.
          </AlertDescription>
        </div>
        <Button 
          onClick={() => navigate("/pricing")}
          className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white"
          size="lg"
        >
          Subscribe to edit and save
        </Button>
      </div>
    </Alert>
  );
};
