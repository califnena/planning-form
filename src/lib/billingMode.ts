export const BILLING_MODE = import.meta.env.VITE_BILLING_MODE || "web_stripe";
export const isStoreIAP = BILLING_MODE === "store_iap";
export const isWebStripe = BILLING_MODE === "web_stripe";
