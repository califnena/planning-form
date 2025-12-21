// Stripe Lookup Keys for all paid products and subscriptions
export const STRIPE_LOOKUP_KEYS = {
  // Subscription Plans
  BASIC: 'EFABASIC',
  PREMIUM: 'EFAPREMIUM',
  PREMIUM_YEAR: 'EFAPREMIUMYEAR',
  VIP_YEAR: 'EFAVIPYEAR',
  VIP_MONTHLY: 'EFAVIPMONTHLY',
  
  // One-Time Products
  DO_IT_FOR_YOU: 'EFADOFORU',
  BINDER: 'EFABINDER',
  
  // Custom Songs
  SONG_STANDARD: 'STANDARDSONG',
  SONG_PREMIUM: 'PREMIUMSONG',
} as const;

export type StripeLookupKey = typeof STRIPE_LOOKUP_KEYS[keyof typeof STRIPE_LOOKUP_KEYS];
