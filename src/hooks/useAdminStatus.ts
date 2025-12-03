import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          if (isMounted) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setUserId(user.id);
        }

        // Call the RPC function to check admin role
        const { data: adminData, error: adminError } = await supabase
          .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
        
        console.log('[useAdminStatus] User:', user.email, 'Admin check result:', adminData, 'Error:', adminError);
        
        if (isMounted) {
          setIsAdmin(adminData === true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useAdminStatus] Error:', error);
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    };

    checkAdminStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAdminStatus] Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsAdmin(false);
          setUserId(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading, userId };
};
