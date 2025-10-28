import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionStatus(userId: string | undefined) {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMasterAccount, setIsMasterAccount] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check for admin role
        if (user) {
          const { data: adminRole } = await supabase
            .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
          
          if (adminRole) {
            setIsMasterAccount(true);
            setHasActiveSubscription(true);
            setIsLoading(false);
            return;
          }
        }

        // Check subscription status
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .single();

        const isActive = subscription?.status === "active";
        setHasActiveSubscription(isActive);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [userId]);

  return { hasActiveSubscription, isLoading, isMasterAccount };
}
