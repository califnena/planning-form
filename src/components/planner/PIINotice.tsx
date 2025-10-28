import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Info } from "lucide-react";

export const PIINotice = () => {
  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-6">
      <Shield className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
        Your Privacy is Protected
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
        <p>
          <strong>We do NOT save sensitive personal information (PII)</strong> such as Social Security Numbers, 
          financial account numbers, insurance policy details, or other sensitive data.
        </p>
        <p>
          You can safely enter this information to generate your PDF, but you'll need to re-enter it each time. 
          This information is <strong>only used for printing</strong> and is never stored in our database.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export const PIISectionWarning = () => {
  return (
    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-900 dark:text-yellow-100">
          <p className="font-semibold mb-1">Privacy Notice: Sensitive Information</p>
          <p>
            For your security, we <strong>do not save</strong> sensitive personal details like SSN, account numbers, 
            or policy numbers. You'll need to re-enter this information when generating your PDF. 
            It's only used for printing and never stored.
          </p>
        </div>
      </div>
    </div>
  );
};