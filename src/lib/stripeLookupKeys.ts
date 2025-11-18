// Stripe Lookup Keys for all paid products and subscriptions
export const STRIPE_LOOKUP_KEYS = {
  // Subscription Plans
  BASIC: 'EFABASIC',
  PREMIUM_YEAR: 'EFAPREMIUMYEAR',
  VIP_YEAR: 'EFAVIPYEAR',
  VIP_MONTHLY: 'EFAVIPMONTHLY',
  
  // One-Time Products
  DO_IT_FOR_YOU: 'EFADOFORU',
  
  // Custom Songs (using existing env var pattern)
  SONG_STANDARD: 'STRIPE_STANDARD_SONG_PRICE_ID',
  SONG_PREMIUM: 'STRIPE_PREMIUM_SONG_PRICE_ID',
} as const;

export type StripeLookupKey = typeof STRIPE_LOOKUP_KEYS[keyof typeof STRIPE_LOOKUP_KEYS];
