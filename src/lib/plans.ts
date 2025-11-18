export const PLANS = {
  BASIC_ANNUAL: {
    key: "basic_annual",
    lookupKey: "EFABASIC",
    name: "Basic (Annual)",
    price: "$9.99 / year",
    description: "",
    features: [
      "Preview all sections",
      "Generate blank PDFs/Word",
      "View-only access (no saved data)"
    ],
  },
  PREMIUM_ANNUAL: {
    key: "premium_annual",
    lookupKey: "EFAPREMIUMYEAR",
    name: "Premium (Annual)",
    price: "$29.99 / year",
    description: "Gain full access to your planning toolkit. Generate blank and prefilled forms, save data in all fields, and create downloadable PDF reports. Email your completed plan, record personal audio or video messages, update anytime, and use multilingual fields. Organize your wishes securely and share easily with loved ones or advisors. Unlimited updates and priority support included.",
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
    lookupKey: "EFAVIPYEAR",
    name: "VIP (Annual)",
    price: "$69 / year",
    description: "Experience complete peace of mind with 24/7 guided planning and emotional support. Includes everything in Premium plus access to a compassionate, AI-powered coach for personalized guidance through end-of-life planning, organization, and coping. Get step-by-step assistance, unlimited updates, and instant help anytime you need support for you or your family.",
    features: [
      "Everything in Premium",
      "24/7 guided planning & coping coach (AI-powered)"
    ],
  },
  VIP_MONTHLY: {
    key: "vip_monthly",
    lookupKey: "EFAVIPMONTHLY",
    name: "VIP (Monthly)",
    price: "$5.99 / month",
    description: "Experience complete peace of mind with 24/7 guided planning and emotional support. Includes everything in Premium plus access to a compassionate, AI-powered coach for personalized guidance through end-of-life planning, organization, and coping. Get step-by-step assistance, unlimited updates, and instant help anytime you need support for you or your family.",
    features: [
      "Everything in Premium (monthly access)",
      "24/7 guided planning & coping coach (AI-powered)"
    ],
  },
  BINDER: {
    key: "fireproof_binder",
    lookupKey: "EFABINDER",
    name: "Fireproof Binder (Add-On)",
    price: "$69.99 one-time (+ shipping)",
    description: "",
    features: ["Physical fireproof binder for printed plan (ships separately)"],
  },
  DO_IT_FOR_YOU: {
    key: "do_it_for_you",
    lookupKey: "EFADOFORU",
    name: "Do It For You (One-Time)",
    price: "$249 one-time",
    description: "Get personalized assistance with a live one-on-one virtual session. We guide you through every question in your planner, complete the forms for you, and prepare a finalized digital copy ready to print or share. Includes expert support, gentle guidance, fireproof binder, and peace of mind knowing everything is handled for you.",
    features: [
      "1:1 virtual interview & walkthrough",
      "We complete your forms for you",
      "Fireproof binder included",
      "Finalized digital copy ready to print"
    ],
  },
} as const;
