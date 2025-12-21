/**
 * Pending Checkout Pattern
 * 
 * When a user clicks any paid button while logged out:
 * 1. Save what they were trying to buy
 * 2. Send them to login
 * 3. After login, automatically send them to Stripe checkout
 * 4. After purchase, send them to the correct destination page
 */

export const PENDING_CHECKOUT_KEY = "efa_pending_checkout";

export type PendingCheckout = {
  lookupKey: string; // EFABASIC, EFAPREMIUM, EFABINDER, EFAVIPMONTHLY, EFAVIPYEAR, EFADOFORU, STANDARDSONG
  mode?: "payment" | "subscription"; // optional, Stripe function will decide based on price type
  successUrl: string;
  cancelUrl: string;
  postSuccessRedirect?: string; // optional: where to land after success
};

/**
 * Save pending checkout details to localStorage
 */
export function setPendingCheckout(pending: PendingCheckout): void {
  localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
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
