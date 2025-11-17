import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const PreviewModeBanner = () => {
  return (
    <Alert className="mb-6 border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <Info className="h-5 w-5 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="text-amber-900 dark:text-amber-200 font-medium ml-2">
        Preview Only — Editing and Downloads Disabled
      </AlertDescription>
    </Alert>
  );
};
