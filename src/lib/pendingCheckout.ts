/**
 * Pending Checkout Pattern
 * 
 * When a user clicks any paid button while logged out:
 * 1. Save what they were trying to buy
 * 2. Send them to login
 * 3. After login, automatically send them to Stripe checkout
 * 4. After purchase, send them to the correct destination page
 */

const PENDING_CHECKOUT_KEY = "efa_pending_checkout";

export interface PendingCheckout {
  lookupKey: string;          // EFABASIC, EFAPREMIUM, EFABINDER, EFAVIPMONTHLY, EFADOFORU, STANDARDSONG
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
}

/**
 * Save pending checkout details to localStorage
 */
export function savePendingCheckout(checkout: PendingCheckout): void {
  localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(checkout));
}

/**
 * Get pending checkout from localStorage
 */
export function getPendingCheckout(): PendingCheckout | null {
  const raw = localStorage.getItem(PENDING_CHECKOUT_KEY);
  if (!raw) return null;
  
  try {
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}

/**
 * Clear pending checkout from localStorage
 */
export function clearPendingCheckout(): void {
  localStorage.removeItem(PENDING_CHECKOUT_KEY);
}

/**
 * Check if there's a pending checkout
 */
export function hasPendingCheckout(): boolean {
  return localStorage.getItem(PENDING_CHECKOUT_KEY) !== null;
}

/**
 * Helper to open checkout URL (handles iframe detection for Lovable preview)
 */
export function openCheckoutUrl(url: string, showToast?: (title: string, description: string) => void): void {
  // In Lovable preview (iframe), Stripe blocks being framed (X-Frame-Options),
  // so we open Checkout in a new tab. In a normal browser session, we redirect.
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (isInIframe) {
    window.open(url, "_blank", "noopener,noreferrer");
    if (showToast) {
      showToast(
        "Checkout opened",
        "Stripe checkout opened in a new tab (preview can't display it inside the frame)."
      );
    }
    return;
  }

  window.location.assign(url);
}

/**
 * Get user-friendly product name from lookup key
 */
export function getProductName(lookupKey: string): string {
  const names: Record<string, string> = {
    EFABASIC: "Printable Planning Form",
    EFAPREMIUM: "Premium Subscription",
    EFABINDER: "Fireproof Binder",
    EFAVIPMONTHLY: "VIP Planning Support (Monthly)",
    EFAVIPYEAR: "VIP Planning Support (Yearly)",
    EFADOFORU: "Do-It-For-You Service",
    STANDARDSONG: "Custom Memorial Song"
  };
  return names[lookupKey] || lookupKey;
}
