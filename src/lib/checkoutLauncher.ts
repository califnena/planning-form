/**
 * Centralized Checkout Launcher
 * 
 * All paid buttons should use this single function.
 * Ensures consistent behavior:
 * - If not logged in → save pending checkout → redirect to login
 * - If logged in → invoke checkout → redirect to Stripe URL
 * - Automatic retry (up to 2x) for transient errors with 1s/3s backoff
 * - Idempotency key prevents double-charging on retry
 * - If URL missing → show error with fallback options
 */

import { supabase } from "@/integrations/supabase/client";
import { setPendingCheckout, getProductName } from "./pendingCheckout";
import { toast } from "sonner";
import { logPaymentError } from "./errorLogger";
import { retryWithBackoff, isTransientError } from "./retryWithBackoff";
import { generateIdempotencyKey } from "./idempotencyKey";
import { trackEvent } from "@/hooks/useActivityTracker";
import { trackCheckoutClicked, sendAnalyticsEvent } from "@/lib/analyticsTracker";

export type CheckoutParams = {
  lookupKey: string;
  successUrl: string;
  cancelUrl: string;
  navigate: (path: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  /** Called with a status message during retries */
  onStatusChange?: (status: string | null) => void;
  /** Timeout in ms before showing error (default: 8000) */
  timeoutMs?: number;
};

export type CheckoutResult = {
  success: boolean;
  redirected: boolean;
  error?: string;
  stripeUrl?: string;
  timedOut?: boolean;
};

// Stripe Payment Link fallback URLs (configure these in Stripe dashboard)
const STRIPE_PAYMENT_LINK_FALLBACK = "https://buy.stripe.com"; // Replace with actual payment link

/**
 * Get the last checkout URL for recovery
 */
export function getLastCheckoutUrl(): string | null {
  return localStorage.getItem("efa_last_checkout_url");
}

/**
 * Check if Stripe scripts are likely blocked
 */
export function checkStripeScriptAccess(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = "https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg?" + Date.now();
    setTimeout(() => resolve(false), 3000);
  });
}

/**
 * Safely open Stripe checkout URL
 */
function openStripeCheckoutSafely(checkoutUrl: string): boolean {
  if (!checkoutUrl || !checkoutUrl.includes("stripe.com")) {
    console.error("[Checkout] Invalid checkout URL:", checkoutUrl);
    return false;
  }

  localStorage.setItem("efa_last_checkout_url", checkoutUrl);
  localStorage.setItem("efa_checkout_return_url", window.location.pathname);

  console.log("[Checkout] Opening Stripe URL:", checkoutUrl);

  const newTab = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

  if (!newTab) {
    console.log("[Checkout] Popup blocked, falling back to redirect");
    try {
      window.location.href = checkoutUrl;
      return true;
    } catch (e) {
      console.error("[Checkout] Redirect failed:", e);
      return false;
    }
  }

  return true;
}

/**
 * Create a timeout promise that rejects after specified ms
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Checkout request timed out after ${ms / 1000} seconds`));
    }, ms);
  });
}

/**
 * Launch Stripe Checkout with proper handling for logged-out users,
 * retry with backoff, idempotency keys, and friendly UX.
 */
export async function launchCheckout({
  lookupKey,
  successUrl,
  cancelUrl,
  navigate,
  onLoadingChange,
  onStatusChange,
  timeoutMs = 8000,
}: CheckoutParams): Promise<CheckoutResult> {
  onLoadingChange?.(true);
  onStatusChange?.(null);
    console.log("[Checkout] Starting checkout for:", lookupKey);
    trackEvent({ eventType: "checkout_start", label: lookupKey });
    trackCheckoutClicked(lookupKey);

  try {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPendingCheckout({ lookupKey, successUrl, cancelUrl });
      toast.info("Sign in to continue", {
        description: `You'll be redirected to purchase ${getProductName(lookupKey)} after signing in.`,
      });
      navigate('/login');
      onLoadingChange?.(false);
      onStatusChange?.(null);
      return { success: true, redirected: false };
    }

    console.log("[Checkout] User authenticated, invoking checkout function");

    // Generate idempotency key to prevent double-charging
    const idempotencyKey = generateIdempotencyKey({
      userId: user.id,
      actionType: "checkout",
      lookupKey,
    });

    // Invoke checkout with retry for transient errors
    const { data, error } = await retryWithBackoff(
      async () => {
        const checkoutPromise = supabase.functions.invoke('stripe-create-checkout', {
          body: {
            lookupKey,
            successUrl,
            cancelUrl,
            idempotencyKey,
          },
        });

        const result = await Promise.race([
          checkoutPromise,
          createTimeout(timeoutMs).catch((e) => { throw e; }),
        ]) as { data: any; error: any };

        if (result.error) {
          const err = new Error(result.error.message || 'Unable to start checkout');
          (err as any).status = result.error.status;
          throw err;
        }

        if (result.data?.error) {
          const err = new Error(result.data.error);
          // Mark server-returned errors as non-transient by default
          (err as any).permanent = true;
          throw err;
        }

        if (!result.data?.url) {
          throw new Error('No checkout URL returned from server');
        }

        return result;
      },
      {
        maxRetries: 2,
        delays: [1000, 3000],
        onRetry: (attempt) => {
          console.log(`[Checkout] Retrying (attempt ${attempt})...`);
          onStatusChange?.("Still working… retrying once more.");
        },
      }
    );

    onStatusChange?.(null);

    console.log("[Checkout] Got Stripe URL, attempting to open");

    const opened = openStripeCheckoutSafely(data.url);

    if (!opened) {
      console.error("[Checkout] Failed to open checkout URL");
      showCheckoutBlockedError(navigate, data.url);
      onLoadingChange?.(false);
      return { success: false, redirected: false, error: "Payment page blocked", stripeUrl: data.url };
    }

    setTimeout(() => {
      onLoadingChange?.(false);
    }, 2000);

    trackEvent({ eventType: "checkout_success", label: lookupKey, value: { stripeUrl: data.url } });
    sendAnalyticsEvent({ event_name: "checkout_success", label: lookupKey });
    return { success: true, redirected: true, stripeUrl: data.url };

  } catch (error: any) {
    console.error('[Checkout] Launch error:', error);
    trackEvent({ eventType: "checkout_fail", label: lookupKey, value: { error: error.message } });
    sendAnalyticsEvent({ event_name: "checkout_fail", label: lookupKey, metadata: { error: error.message } });
    onStatusChange?.(null);

    const isTimeout = error.message?.includes('timed out');
    const lastUrl = getLastCheckoutUrl();

    // Log as PAYMENT_ERROR with Stripe IDs
    const checkoutSessionId = lastUrl?.match(/cs_[a-zA-Z0-9_]+/)?.[0] || null;
    logPaymentError({
      error_message: error.message || "Unknown checkout error",
      checkout_session_id: checkoutSessionId,
      payment_intent_id: null,
      lookup_key: lookupKey,
      stack_trace: error.stack,
      severity: isTimeout ? "warning" : "error",
    });

    toast.error("We're sorry. Something unexpected happened.", {
      description: "Our team has been notified and is already reviewing the issue. You may try again in a few minutes.",
      action: {
        label: "Try Again",
        onClick: () => {
          if (isTimeout && lastUrl) {
            window.open(lastUrl, '_blank');
          } else {
            window.location.reload();
          }
        },
      },
      duration: 15000,
    });

    onLoadingChange?.(false);
    return {
      success: false,
      redirected: false,
      error: error.message,
      timedOut: isTimeout,
    };
  }
}

/**
 * Show a helpful error toast when checkout is blocked
 */
function showCheckoutBlockedError(navigate: (path: string) => void, checkoutUrl?: string | null) {
  toast.error("We're sorry. Something unexpected happened.", {
    description: "Our team has been notified and is already reviewing the issue. You may try again in a few minutes.",
    action: {
      label: checkoutUrl ? "Open in New Tab" : "Get Help",
      onClick: () => {
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        } else {
          navigate('/payment-help');
        }
      },
    },
    duration: 15000,
  });
}

/**
 * Retry checkout with the last known Stripe URL
 */
export function retryLastCheckout(): boolean {
  const lastUrl = getLastCheckoutUrl();
  if (lastUrl) {
    console.log("[Checkout] Retrying with last URL:", lastUrl);
    window.open(lastUrl, '_blank');
    return true;
  }
  return false;
}

/**
 * Get troubleshooting message for checkout issues
 */
export function getCheckoutTroubleshootingMessage(): string {
  return `If the payment page looks blank or won't load:
• Try opening in a new tab or window
• Disable ad blockers or privacy extensions
• Try a different browser (Chrome, Safari, Firefox)
• If on a work network, try your phone's mobile data
• Disable iCloud Private Relay or VPN temporarily`;
}

/**
 * Validate that Stripe key mode matches price mode
 */
export function validateStripeModeMatch(publishableKey: string, priceId?: string): string | null {
  const isTestKey = publishableKey?.startsWith('pk_test_');
  const isLiveKey = publishableKey?.startsWith('pk_live_');

  if (!isTestKey && !isLiveKey) {
    return "Invalid Stripe publishable key format";
  }

  return null;
}
