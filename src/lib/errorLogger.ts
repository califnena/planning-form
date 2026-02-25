/**
 * Client-side error logger — sends critical errors to the backend error_logs table.
 * Fire-and-forget: never throws, never blocks the UI.
 */

import { supabase } from "@/integrations/supabase/client";

export type ErrorLogPayload = {
  action: string;
  error_message: string;
  stack_trace?: string;
  stripe_event_id?: string;
  metadata?: Record<string, unknown>;
  severity?: "warning" | "error" | "critical";
};

/**
 * Log a Stripe-specific PAYMENT_ERROR with checkout/payment intent IDs.
 */
export function logPaymentError(opts: {
  error_message: string;
  checkout_session_id?: string | null;
  payment_intent_id?: string | null;
  lookup_key?: string;
  stack_trace?: string;
  severity?: "warning" | "error" | "critical";
}): void {
  logCriticalError({
    action: "PAYMENT_ERROR",
    error_message: opts.error_message,
    stack_trace: opts.stack_trace,
    stripe_event_id: opts.checkout_session_id || undefined,
    severity: opts.severity || "error",
    metadata: {
      checkout_session_id: opts.checkout_session_id || null,
      payment_intent_id: opts.payment_intent_id || null,
      lookup_key: opts.lookup_key || null,
    },
  });
}

export async function logCriticalError(payload: ErrorLogPayload): Promise<void> {
  try {
    // Gather context
    const { data: { user } } = await supabase.auth.getUser();

    const body = {
      ...payload,
      user_id: user?.id || null,
      user_email: user?.email || null,
      page_url: window.location.href,
      severity: payload.severity || "error",
    };

    // Fire-and-forget — don't await in caller
    supabase.functions.invoke("log-error", { body }).catch((err) => {
      console.error("[errorLogger] Failed to send error log:", err);
    });
  } catch {
    // Silently fail — logging should never break the app
  }
}
