import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { checkPaidAccess, checkVIPAccess, checkPrintableAccess, checkDoneForYouAccess, isAdminUser } from "@/lib/accessChecks";

const LAST_VISITED_KEY = "efa_last_visited_route";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  // Admin status - bypasses all paywalls
  isAdmin: boolean;
  // Purchase states
  hasPaidAccess: boolean;
  hasVIPAccess: boolean;
  hasPrintableAccess: boolean;
  hasDoneForYouAccess: boolean;
  // Utility functions
  saveLastVisitedRoute: (route: string) => void;
  getLastVisitedRoute: () => string | null;
  clearLastVisitedRoute: () => void;
}

/**
 * Central auth state hook with purchase tracking and redirect safety.
 * Use this everywhere for consistent auth state management.
 */
export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Purchase states
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [hasVIPAccess, setHasVIPAccess] = useState(false);
  const [hasPrintableAccess, setHasPrintableAccess] = useState(false);
  const [hasDoneForYouAccess, setHasDoneForYouAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load purchase states when user changes
  const loadPurchaseStates = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setHasPaidAccess(false);
      setHasVIPAccess(false);
      setHasPrintableAccess(false);
      setHasDoneForYouAccess(false);
      setIsAdmin(false);
      return;
    }

    // Load all access states in parallel (including admin check)
    const [paid, vip, printable, dfy, admin] = await Promise.all([
      checkPaidAccess(),
      checkVIPAccess(),
      checkPrintableAccess(),
      checkDoneForYouAccess(),
      isAdminUser()
    ]);

    setHasPaidAccess(paid);
    setHasVIPAccess(vip);
    setHasPrintableAccess(printable);
    setHasDoneForYouAccess(dfy);
    setIsAdmin(admin);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Load purchase states with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            loadPurchaseStates(session.user.id);
          }, 0);
        } else {
          setHasPaidAccess(false);
          setHasVIPAccess(false);
          setHasPrintableAccess(false);
          setHasDoneForYouAccess(false);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        loadPurchaseStates(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadPurchaseStates]);

  // Redirect safety functions
  const saveLastVisitedRoute = useCallback((route: string) => {
    // Don't save auth-related routes
    if (!route.includes('/login') && !route.includes('/signup') && !route.includes('/reset-password')) {
      localStorage.setItem(LAST_VISITED_KEY, route);
    }
  }, []);

  const getLastVisitedRoute = useCallback(() => {
    return localStorage.getItem(LAST_VISITED_KEY);
  }, []);

  const clearLastVisitedRoute = useCallback(() => {
    localStorage.removeItem(LAST_VISITED_KEY);
  }, []);

  return {
    user,
    session,
    isLoggedIn: !!user,
    isLoading,
    isAdmin,
    hasPaidAccess,
    hasVIPAccess,
    hasPrintableAccess,
    hasDoneForYouAccess,
    saveLastVisitedRoute,
    getLastVisitedRoute,
    clearLastVisitedRoute
  };
}
