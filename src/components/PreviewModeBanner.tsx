import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const PreviewModeBanner = () => {
  return (
    <Alert className="mb-6 border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 shadow-md">
      <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-900 dark:text-amber-200 font-bold text-lg">
        PREVIEW MODE - Read Only
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-300 font-medium mt-1">
        Editing and downloads are disabled. Subscribe to unlock full access.
      </AlertDescription>
    </Alert>
  );
};
