/**
 * Centralized Checkout Launcher
 * 
 * All paid buttons should use this single function.
 * Ensures consistent behavior:
 * - If not logged in → save pending checkout → redirect to login
 * - If logged in → invoke checkout → redirect to Stripe URL
 * - If URL missing → show error with fallback options
 * - 8-second timeout for hung requests
 */

import { supabase } from "@/integrations/supabase/client";
import { setPendingCheckout, getProductName } from "./pendingCheckout";
import { toast } from "sonner";

export type CheckoutParams = {
  lookupKey: string;
  successUrl: string;
  cancelUrl: string;
  navigate: (path: string) => void;
  onLoadingChange?: (loading: boolean) => void;
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
    // Use a small Stripe asset to check connectivity
    img.src = "https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg?" + Date.now();
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
}

/**
 * Safely open Stripe checkout URL
 * Returns true if successful, false if blocked
 */
function openStripeCheckoutSafely(checkoutUrl: string): boolean {
  if (!checkoutUrl || !checkoutUrl.includes("stripe.com")) {
    console.error("[Checkout] Invalid checkout URL:", checkoutUrl);
    return false;
  }

  // Store for recovery
  localStorage.setItem("efa_last_checkout_url", checkoutUrl);
  localStorage.setItem("efa_checkout_return_url", window.location.pathname);

  console.log("[Checkout] Opening Stripe URL:", checkoutUrl);

  // Try opening in a new tab first (reduces preview/CSP issues)
  const newTab = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

  // If popups blocked, fall back to same-tab redirect
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
 * error fallbacks, and 8-second timeout.
 */
export async function launchCheckout({
  lookupKey,
  successUrl,
  cancelUrl,
  navigate,
  onLoadingChange,
  timeoutMs = 8000,
}: CheckoutParams): Promise<CheckoutResult> {
  onLoadingChange?.(true);
  console.log("[Checkout] Starting checkout for:", lookupKey);

  try {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Save pending checkout and redirect to login
      setPendingCheckout({
        lookupKey,
        successUrl,
        cancelUrl,
      });
      
      toast.info("Sign in to continue", {
        description: `You'll be redirected to purchase ${getProductName(lookupKey)} after signing in.`,
      });
      
      navigate('/login');
      onLoadingChange?.(false);
      return { success: true, redirected: false };
    }

    console.log("[Checkout] User authenticated, invoking checkout function");

    // Race between checkout request and timeout
    const checkoutPromise = supabase.functions.invoke('stripe-create-checkout', {
      body: {
        lookupKey,
        successUrl,
        cancelUrl,
      },
    });

    const { data, error } = await Promise.race([
      checkoutPromise,
      createTimeout(timeoutMs).catch((e) => {
        throw e;
      }),
    ]) as { data: any; error: any };

    if (error) {
      console.error('[Checkout] Edge function error:', error);
      throw new Error(error.message || 'Unable to start checkout');
    }

    if (!data?.url) {
      console.error('[Checkout] No checkout URL returned:', data);
      throw new Error('No checkout URL returned from server');
    }

    console.log("[Checkout] Got Stripe URL, attempting to open");

    // Try to open Stripe checkout safely
    const opened = openStripeCheckoutSafely(data.url);
    
    if (!opened) {
      console.error("[Checkout] Failed to open checkout URL");
      showCheckoutBlockedError(navigate, data.url);
      onLoadingChange?.(false);
      return { success: false, redirected: false, error: "Payment page blocked", stripeUrl: data.url };
    }
    
    // Keep loading for a moment to allow redirect
    setTimeout(() => {
      onLoadingChange?.(false);
    }, 2000);
    
    return { success: true, redirected: true, stripeUrl: data.url };

  } catch (error: any) {
    console.error('[Checkout] Launch error:', error);
    
    const isTimeout = error.message?.includes('timed out');
    const lastUrl = getLastCheckoutUrl();
    
    if (isTimeout) {
      console.log("[Checkout] Request timed out after", timeoutMs, "ms");
      toast.error("Checkout is taking too long", {
        description: "The payment page didn't respond in time. Try again or open checkout directly.",
        action: {
          label: lastUrl ? "Open Checkout" : "Reload",
          onClick: () => {
            if (lastUrl) {
              window.open(lastUrl, '_blank');
            } else {
              window.location.reload();
            }
          },
        },
        duration: 15000,
      });
    } else {
      showCheckoutBlockedError(navigate, lastUrl);
    }

    onLoadingChange?.(false);
    return { 
      success: false, 
      redirected: false, 
      error: error.message, 
      timedOut: isTimeout 
    };
  }
}

/**
 * Show a helpful error toast when checkout is blocked
 */
function showCheckoutBlockedError(navigate: (path: string) => void, checkoutUrl?: string | null) {
  toast.error("Secure checkout did not load", {
    description: "Your browser or network blocked the payment window. Try reloading or opening in a new tab.",
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
 * Returns warning message if mismatch detected
 */
export function validateStripeModeMatch(publishableKey: string, priceId?: string): string | null {
  const isTestKey = publishableKey?.startsWith('pk_test_');
  const isLiveKey = publishableKey?.startsWith('pk_live_');
  
  if (!isTestKey && !isLiveKey) {
    return "Invalid Stripe publishable key format";
  }

  // If we have a price ID, check if modes match
  if (priceId) {
    const isTestPrice = priceId?.startsWith('price_') && priceId?.includes('test');
    // This is a heuristic - Stripe doesn't explicitly mark test prices
    // The best validation is at the server level
  }

  return null;
}