import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye } from "lucide-react";

export const PreviewModeBanner = () => {
  return (
    <Alert className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-900/20 shadow-sm">
      <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-200 font-semibold">
        You're Viewing a Preview
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-300 mt-1">
        Sign in only when you're ready to save or personalize your plan. No pressure—take your time to explore.
      </AlertDescription>
    </Alert>
  );
};
