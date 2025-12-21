/**
 * Safe Checkout Helper
 * Wrapper for opening Stripe checkout URLs safely with proper fallbacks
 */

type SafeCheckoutOptions = {
  checkoutUrl: string;
  onError: (title: string, body: string) => void;
};

export function openStripeCheckoutSafely({ checkoutUrl, onError }: SafeCheckoutOptions): boolean {
  // Basic sanity check
  if (!checkoutUrl || !checkoutUrl.includes("stripe.com")) {
    onError(
      "Payment link could not be opened",
      "We could not start the payment page. Please try again in a moment. If it keeps happening, contact us."
    );
    return false;
  }

  // Store for recovery
  localStorage.setItem("efa_last_checkout_url", checkoutUrl);

  // Try opening in a new tab first (reduces preview/CSP issues)
  const newTab = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

  // If popups blocked, fall back to same-tab redirect
  if (!newTab) {
    try {
      window.location.href = checkoutUrl;
      return true;
    } catch {
      onError(
        "Payment link blocked",
        "Your browser blocked the payment window. Please allow popups for this site or try again."
      );
      return false;
    }
  }

  return true;
}
