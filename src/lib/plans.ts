export const PLANS = {
  BASIC_ANNUAL: {
    key: "basic_annual",
    name: "Basic (Annual)",
    price: "$29 / year",
    payLink: "https://buy.stripe.com/6oU28r2x75OrbLxg6q7bW00",
    description: "",
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
    name: "VIP (Annual)",
    price: "$69 / year",
    payLink: "https://buy.stripe.com/5kQ9ATfjT0u78zl1bw7bW04",
    description: "Experience complete peace of mind with 24/7 guided planning and emotional support. Includes everything in Premium plus access to a compassionate, AI-powered coach for personalized guidance through end-of-life planning, organization, and coping. Get step-by-step assistance, unlimited updates, and instant help anytime you need support for you or your family.",
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
    description: "Experience complete peace of mind with 24/7 guided planning and emotional support. Includes everything in Premium plus access to a compassionate, AI-powered coach for personalized guidance through end-of-life planning, organization, and coping. Get step-by-step assistance, unlimited updates, and instant help anytime you need support for you or your family.",
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
    description: "",
    features: ["Physical fireproof binder for printed plan (ships separately)"],
  },
  DO_IT_FOR_YOU: {
    key: "do_it_for_you",
    name: "Do It For You (One-Time)",
    price: "$249 one-time",
    payLink: "https://buy.stripe.com/4gM6oHgnXfp18zl2fA7bW03",
    description: "Get personalized assistance with a live one-on-one virtual session. We guide you through every question in your planner, complete the forms for you, and prepare a finalized digital copy ready to print or share. Includes expert support, gentle guidance, fireproof binder, and peace of mind knowing everything is handled for you.",
    features: [
      "1:1 virtual interview & walkthrough",
      "We complete your forms for you",
      "Fireproof binder included",
      "Finalized digital copy ready to print"
    ],
  },
} as const;
