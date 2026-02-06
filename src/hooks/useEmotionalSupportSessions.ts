import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsRemaining: number;
  firstSessionShown: boolean;
  isLoading: boolean;
  hasAccess: boolean;
}

export function useEmotionalSupportSessions(userId: string | null) {
  const [sessionData, setSessionData] = useState<SessionData>({
    sessionsUsed: 0,
    sessionsLimit: 5,
    sessionsRemaining: 5,
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
          sessionsUsed: existingSession.sessions_used,
          sessionsLimit: existingSession.sessions_limit,
          sessionsRemaining: existingSession.sessions_limit - existingSession.sessions_used,
          firstSessionShown: existingSession.first_session_shown,
          isLoading: false,
          hasAccess: true,
        });
      } else {
        // Create new record for this billing period
        const { data: newSession, error: insertError } = await supabase
          .from("emotional_support_sessions")
          .insert({
            user_id: userId,
            billing_period_start: billingPeriodStart,
            sessions_used: 0,
            sessions_limit: 5,
            first_session_shown: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating session record:", insertError);
        }

        setSessionData({
          sessionsUsed: 0,
          sessionsLimit: 5,
          sessionsRemaining: 5,
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

  const consumeSession = useCallback(async (): Promise<boolean> => {
    if (!userId || sessionData.sessionsRemaining <= 0) {
      return false;
    }

    const billingPeriodStart = getBillingPeriodStart();

    const { error } = await supabase
      .from("emotional_support_sessions")
      .update({ 
        sessions_used: sessionData.sessionsUsed + 1 
      })
      .eq("user_id", userId)
      .eq("billing_period_start", billingPeriodStart);

    if (error) {
      console.error("Error consuming session:", error);
      return false;
    }

    setSessionData(prev => ({
      ...prev,
      sessionsUsed: prev.sessionsUsed + 1,
      sessionsRemaining: prev.sessionsRemaining - 1,
    }));

    return true;
  }, [userId, sessionData.sessionsUsed, sessionData.sessionsRemaining, getBillingPeriodStart]);

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
    consumeSession,
    markFirstSessionShown,
    refetch: fetchSessionData,
  };
}
