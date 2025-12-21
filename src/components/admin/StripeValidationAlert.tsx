import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StripeValidationResult } from "@/lib/stripeLookupKeys";

interface StripeValidationAlertProps {
  lookupKeys: string[];
  isAdmin: boolean;
}

export const StripeValidationAlert = ({ lookupKeys, isAdmin }: StripeValidationAlertProps) => {
  const [validationResult, setValidationResult] = useState<StripeValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-validate-prices', {
        body: { lookupKeys },
      });

      if (fnError) throw fnError;
      
      setValidationResult(data as StripeValidationResult);
      
      // Log issues to console for debugging
      if (data?.missing?.length > 0) {
        console.warn('[Stripe Validation] Missing lookup keys:', data.missing);
      }
      if (data?.inactive?.length > 0) {
        console.warn('[Stripe Validation] Inactive lookup keys:', data.inactive);
      }
      if (data?.duplicates?.length > 0) {
        console.warn('[Stripe Validation] Duplicate lookup keys:', data.duplicates);
      }
    } catch (err) {
      console.error('[Stripe Validation] Error:', err);
      setError('Failed to validate Stripe configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validate();
  }, [lookupKeys.join(',')]);

  // Don't show anything if not admin and no critical issues
  const hasCriticalIssues = validationResult && (
    validationResult.missing.length > 0 || 
    validationResult.inactive.length > 0
  );

  // Only show to admins or if there are issues
  if (!isAdmin && !hasCriticalIssues) {
    return null;
  }

  // Loading state - only show to admins
  if (isLoading && isAdmin) {
    return (
      <Alert className="mb-6 border-muted bg-muted/30">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Stripe configuration...</AlertTitle>
      </Alert>
    );
  }

  // Error state - only show to admins
  if (error && isAdmin) {
    return (
      <Alert className="mb-6 border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle>Stripe Validation Error</AlertTitle>
        <AlertDescription className="mt-2 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={validate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // All good - show success only to admins
  if (!hasCriticalIssues && isAdmin && validationResult) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Stripe configuration valid</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          All {validationResult.found.length} lookup keys are active and properly configured.
        </AlertDescription>
      </Alert>
    );
  }

  // Issues found - show to admins with full details
  if (hasCriticalIssues && validationResult) {
    if (isAdmin) {
      return (
        <Alert className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Stripe setup issue detected</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300 mt-3 space-y-3">
            {validationResult.missing.length > 0 && (
              <div>
                <strong>Missing lookup keys:</strong>
                <ul className="list-disc list-inside mt-1">
                  {validationResult.missing.map(key => (
                    <li key={key} className="font-mono text-sm">{key}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.inactive.length > 0 && (
              <div>
                <strong>Inactive prices:</strong>
                <ul className="list-disc list-inside mt-1">
                  {validationResult.inactive.map(key => (
                    <li key={key} className="font-mono text-sm">{key}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.duplicates.length > 0 && (
              <div>
                <strong>Duplicate active prices:</strong>
                <ul className="list-disc list-inside mt-1">
                  {validationResult.duplicates.map(dup => (
                    <li key={dup.lookupKey} className="font-mono text-sm">
                      {dup.lookupKey} ({dup.count} active prices found)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm mt-4 text-amber-600 dark:text-amber-400">
              Fix these in Stripe and refresh this page.
            </p>
            
            <Button variant="outline" size="sm" onClick={validate} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    // Non-admin with issues - show friendly message
    return (
      <Alert className="mb-6 border-muted bg-muted/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Some plans temporarily unavailable</AlertTitle>
        <AlertDescription>
          We couldn't load some pricing options. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
