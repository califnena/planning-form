/**
 * Centralized Checkout Launcher
 * 
 * All paid buttons should use this single function.
 * Ensures consistent behavior:
 * - If not logged in → save pending checkout → redirect to login
 * - If logged in → invoke checkout → redirect to Stripe URL
 * - If URL missing → show error with fallback options
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
};

export type CheckoutResult = {
  success: boolean;
  redirected: boolean;
  error?: string;
  stripeUrl?: string;
};

/**
 * Get the last checkout URL for recovery
 */
export function getLastCheckoutUrl(): string | null {
  return localStorage.getItem("efa_last_checkout_url");
}

/**
 * Safely open Stripe checkout URL
 * Returns true if successful, false if blocked
 */
function openStripeCheckoutSafely(checkoutUrl: string): boolean {
  if (!checkoutUrl || !checkoutUrl.includes("stripe.com")) {
    return false;
  }

  // Store for recovery
  localStorage.setItem("efa_last_checkout_url", checkoutUrl);
  localStorage.setItem("efa_checkout_return_url", window.location.pathname);

  // Try opening in a new tab first (reduces preview/CSP issues)
  const newTab = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

  // If popups blocked, fall back to same-tab redirect
  if (!newTab) {
    try {
      window.location.href = checkoutUrl;
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Launch Stripe Checkout with proper handling for logged-out users
 * and error fallbacks.
 */
export async function launchCheckout({
  lookupKey,
  successUrl,
  cancelUrl,
  navigate,
  onLoadingChange,
}: CheckoutParams): Promise<CheckoutResult> {
  onLoadingChange?.(true);

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

    // User is logged in - invoke checkout
    const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
      body: {
        lookupKey,
        successUrl,
        cancelUrl,
      },
    });

    if (error) {
      console.error('Checkout error:', error);
      throw new Error(error.message || 'Unable to start checkout');
    }

    if (!data?.url) {
      console.error('No checkout URL returned');
      throw new Error('No checkout URL returned from server');
    }

    // Try to open Stripe checkout safely
    const opened = openStripeCheckoutSafely(data.url);
    
    if (!opened) {
      toast.error("Payment page blocked", {
        description: "Your browser blocked the payment window. Visit Payment Help for troubleshooting steps.",
        action: {
          label: "Get Help",
          onClick: () => navigate('/payment-help'),
        },
        duration: 10000,
      });
      onLoadingChange?.(false);
      return { success: false, redirected: false, error: "Payment page blocked" };
    }
    
    return { success: true, redirected: true, stripeUrl: data.url };

  } catch (error: any) {
    console.error('Checkout launch error:', error);
    
    // Show error with helpful fallback options
    const lastUrl = getLastCheckoutUrl();
    
    toast.error("Unable to start checkout", {
      description: "Please try again. If the payment page looks blank, visit Payment Help.",
      action: {
        label: lastUrl ? "Open in new tab" : "Get Help",
        onClick: () => {
          if (lastUrl) {
            window.open(lastUrl, '_blank');
          } else {
            navigate('/payment-help');
          }
        },
      },
      duration: 10000,
    });

    onLoadingChange?.(false);
    return { success: false, redirected: false, error: error.message };
  }
}

/**
 * Retry checkout with the last known Stripe URL
 */
export function retryLastCheckout(): boolean {
  const lastUrl = getLastCheckoutUrl();
  if (lastUrl) {
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
• If on a work network, try your phone's mobile data`;
}