export const PLANS = {
  BASIC_ANNUAL: {
    key: "basic_annual",
    name: "Basic (Annual)",
    price: "$29 / year",
    payLink: "https://buy.stripe.com/6oU28r2x75OrbLxg6q7bW00",
    features: [
      "Preview all sections",
      "Generate blank PDFs/Word",
      "View-only access (no saved data)"
    ],
  },
  PREMIUM_ANNUAL: {
    key: "premium_annual",
    name: "Premium (Annual)",
    price: "$59 / year",
    payLink: "https://buy.stripe.com/14A5kD6Nn3Gjg1NdYi7bW02",
    features: [
      "Generate blank & prefilled forms",
      "Enter & save data (all fields)",
      "Generate filled PDFs",
      "Email plans",
      "Unlimited updates",
      "Multilingual fields",
      "Record audio/video notes & download",
      "Priority support"
    ],
  },
  VIP_ANNUAL: {
    key: "vip_annual",
    name: "VIP (Annual)",
    price: "$69 / year",
    payLink: "https://buy.stripe.com/5kQ9ATfjT0u78zl1bw7bW04",
    features: [
      "Everything in Premium",
      "24/7 guided planning & coping coach (AI-powered)"
    ],
  },
  VIP_MONTHLY: {
    key: "vip_monthly",
    name: "VIP (Monthly)",
    price: "$5.99 / month",
    payLink: "https://buy.stripe.com/28E8wP4Ff5OrbLx5rM7bW05",
    features: [
      "Everything in Premium (monthly access)",
      "24/7 guided planning & coping coach (AI-powered)"
    ],
  },
  BINDER: {
    key: "fireproof_binder",
    name: "Fireproof Binder (Add-On)",
    price: "$89 one-time (+ shipping)",
    payLink: "https://buy.stripe.com/eVqcN5dbLfp1aHt8DY7bW01",
    features: ["Physical fireproof binder for printed plan (ships separately)"],
  },
  DO_IT_FOR_YOU: {
    key: "do_it_for_you",
    name: "Do It For You (One-Time)",
    price: "$249 one-time",
    payLink: "https://buy.stripe.com/4gM6oHgnXfp18zl2fA7bW03",
    features: [
      "1:1 virtual interview & walkthrough",
      "We complete your forms for you",
      "Finalized digital copy (binder sold separately)"
    ],
  },
} as const;
