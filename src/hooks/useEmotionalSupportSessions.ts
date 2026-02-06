import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Monthly limit for emotional support messages
const EMOTIONAL_SUPPORT_MONTHLY_LIMIT = 200;

interface SessionData {
  messagesUsed: number;
  messagesLimit: number;
  messagesRemaining: number;
  firstSessionShown: boolean;
  isLoading: boolean;
  hasAccess: boolean;
}

export function useEmotionalSupportSessions(userId: string | null) {
  const [sessionData, setSessionData] = useState<SessionData>({
    messagesUsed: 0,
    messagesLimit: EMOTIONAL_SUPPORT_MONTHLY_LIMIT,
    messagesRemaining: EMOTIONAL_SUPPORT_MONTHLY_LIMIT,
    firstSessionShown: false,
    isLoading: true,
    hasAccess: false,
  });

  // Get the start of the current billing period (first of the month)
  const getBillingPeriodStart = useCallback(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }, []);

  const fetchSessionData = useCallback(async () => {
    if (!userId) {
      setSessionData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const billingPeriodStart = getBillingPeriodStart();

      // Check if user has personal support access
      const { data: hasVIPAccess } = await supabase
        .rpc('has_vip_access', { _user_id: userId });

      if (!hasVIPAccess) {
        // Also check subscriptions table
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("plan_type")
          .eq("user_id", userId)
          .eq("status", "active")
          .single();

        const hasAccess = subscription?.plan_type === "vip_annual" || subscription?.plan_type === "vip_monthly";
        
        if (!hasAccess) {
          setSessionData(prev => ({ 
            ...prev, 
            isLoading: false,
            hasAccess: false 
          }));
          return;
        }
      }

      // Fetch or create session record for this billing period
      const { data: existingSession, error: fetchError } = await supabase
        .from("emotional_support_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("billing_period_start", billingPeriodStart)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching session data:", fetchError);
        setSessionData(prev => ({ ...prev, isLoading: false, hasAccess: true }));
        return;
      }

      if (existingSession) {
        setSessionData({
          messagesUsed: existingSession.sessions_used,
          messagesLimit: existingSession.sessions_limit,
          messagesRemaining: existingSession.sessions_limit - existingSession.sessions_used,
          firstSessionShown: existingSession.first_session_shown,
          isLoading: false,
          hasAccess: true,
        });
      } else {
        // Create new record for this billing period with 200 message limit
        const { data: newSession, error: insertError } = await supabase
          .from("emotional_support_sessions")
          .insert({
            user_id: userId,
            billing_period_start: billingPeriodStart,
            sessions_used: 0,
            sessions_limit: EMOTIONAL_SUPPORT_MONTHLY_LIMIT,
            first_session_shown: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating session record:", insertError);
        }

        setSessionData({
          messagesUsed: 0,
          messagesLimit: EMOTIONAL_SUPPORT_MONTHLY_LIMIT,
          messagesRemaining: EMOTIONAL_SUPPORT_MONTHLY_LIMIT,
          firstSessionShown: false,
          isLoading: false,
          hasAccess: true,
        });
      }
    } catch (error) {
      console.error("Error in fetchSessionData:", error);
      setSessionData(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, getBillingPeriodStart]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const consumeMessage = useCallback(async (): Promise<boolean> => {
    if (!userId || sessionData.messagesRemaining <= 0) {
      return false;
    }

    const billingPeriodStart = getBillingPeriodStart();

    const { error } = await supabase
      .from("emotional_support_sessions")
      .update({ 
        sessions_used: sessionData.messagesUsed + 1 
      })
      .eq("user_id", userId)
      .eq("billing_period_start", billingPeriodStart);

    if (error) {
      console.error("Error consuming message:", error);
      return false;
    }

    setSessionData(prev => ({
      ...prev,
      messagesUsed: prev.messagesUsed + 1,
      messagesRemaining: prev.messagesRemaining - 1,
    }));

    return true;
  }, [userId, sessionData.messagesUsed, sessionData.messagesRemaining, getBillingPeriodStart]);

  const markFirstSessionShown = useCallback(async () => {
    if (!userId) return;

    const billingPeriodStart = getBillingPeriodStart();

    await supabase
      .from("emotional_support_sessions")
      .update({ first_session_shown: true })
      .eq("user_id", userId)
      .eq("billing_period_start", billingPeriodStart);

    setSessionData(prev => ({ ...prev, firstSessionShown: true }));
  }, [userId, getBillingPeriodStart]);

  return {
    ...sessionData,
    consumeMessage,
    markFirstSessionShown,
    refetch: fetchSessionData,
  };
}
