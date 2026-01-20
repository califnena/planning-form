import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

type ToastFn = (options: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) => void;

/**
 * Checks if an error indicates an expired or missing auth session.
 */
export function isAuthExpiredError(err: any): boolean {
  if (!err) return false;
  
  // Check for status code 401
  if (err?.status === 401) return true;
  
  // Check error message patterns
  const message = err?.message?.toLowerCase?.() || "";
  const errorDescription = err?.error_description?.toLowerCase?.() || "";
  
  const authErrorPatterns = [
    "jwt",
    "auth session missing",
    "session expired",
    "invalid token",
    "token expired",
    "not authenticated",
    "unauthorized",
    "refresh_token",
  ];
  
  return authErrorPatterns.some(
    (pattern) => message.includes(pattern) || errorDescription.includes(pattern)
  );
}

/**
 * Ensures an active session exists. If not, shows a toast and redirects to login.
 * Returns the access_token if valid, or null if the user should be redirected.
 */
export async function requireSessionOrRedirect(
  navigate: NavigateFunction,
  toast: ToastFn
): Promise<string | null> {
  const { data: sessionData, error } = await supabase.auth.getSession();
  
  if (error || !sessionData.session?.access_token) {
    toast({
      title: "Session expired",
      description: "Please log in again.",
      variant: "destructive",
    });
    navigate("/login");
    return null;
  }
  
  return sessionData.session.access_token;
}
