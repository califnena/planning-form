import { useState, useEffect } from "react";
import { checkPrintableOnlyAccess } from "@/lib/accessChecks";

/**
 * Hook to check if user has ONLY printable access (EFABASIC only)
 * These users should be restricted to printable downloads, not the digital planner
 */
export function usePrintableOnlyAccess() {
  const [isPrintableOnly, setIsPrintableOnly] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function check() {
      try {
        const result = await checkPrintableOnlyAccess();
        if (mounted) {
          setIsPrintableOnly(result);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking printable-only access:", error);
        if (mounted) {
          setIsPrintableOnly(false);
          setIsLoading(false);
        }
      }
    }
    
    check();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { isPrintableOnly, isLoading };
}
