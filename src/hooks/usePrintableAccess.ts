import { useState, useEffect } from "react";
import { checkBasicPrintablesAccess, checkAdminAccess } from "@/lib/accessChecks";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if user has access to EFABASIC printable form
 * Returns true if user is admin OR has purchased EFABASIC (printable role)
 */
export function usePrintableAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        // First check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (!user) {
          setIsLoggedIn(false);
          setHasAccess(false);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setIsLoggedIn(true);

        // Check admin status (admins bypass all checks)
        const adminAccess = await checkAdminAccess();
        if (!mounted) return;
        
        if (adminAccess) {
          setIsAdmin(true);
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        // Check printable access (EFABASIC or higher)
        const printableAccess = await checkBasicPrintablesAccess();
        if (!mounted) return;
        
        setHasAccess(printableAccess);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking printable access:", error);
        if (mounted) {
          setHasAccess(false);
          setIsLoading(false);
        }
      }
    }

    checkAccess();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAccess();
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setHasAccess(false);
          setIsAdmin(false);
          setIsLoggedIn(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { hasAccess, isAdmin, isLoggedIn, isLoading };
}
