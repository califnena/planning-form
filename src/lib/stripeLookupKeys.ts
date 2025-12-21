// Stripe Lookup Keys for all paid products and subscriptions
// This is the SINGLE SOURCE OF TRUTH for all Stripe lookup keys in the app

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

// All canonical lookup keys - the source of truth for validation
export const ALL_CANONICAL_LOOKUP_KEYS = [
  'EFABASIC',
  'EFAPREMIUM',
  'EFABINDER',
  'EFAVIPMONTHLY',
  'EFAVIPYEAR',
  'EFADOFORU',
  'STANDARDSONG',
  'PREMIUMSONG',
] as const;

export type StripeLookupKey = typeof STRIPE_LOOKUP_KEYS[keyof typeof STRIPE_LOOKUP_KEYS];

// All lookup keys as an array - used for validation
export const ALL_LOOKUP_KEYS: StripeLookupKey[] = Object.values(STRIPE_LOOKUP_KEYS);

// Lookup keys used on the /plans page
export const PLANS_PAGE_LOOKUP_KEYS: StripeLookupKey[] = [
  STRIPE_LOOKUP_KEYS.BASIC,
  STRIPE_LOOKUP_KEYS.PREMIUM_YEAR,
  STRIPE_LOOKUP_KEYS.VIP_YEAR,
  STRIPE_LOOKUP_KEYS.VIP_MONTHLY,
];

// Lookup keys used on the /pricing page
export const PRICING_PAGE_LOOKUP_KEYS: StripeLookupKey[] = [
  STRIPE_LOOKUP_KEYS.PREMIUM,
  STRIPE_LOOKUP_KEYS.BASIC,
  STRIPE_LOOKUP_KEYS.BINDER,
];

// Validation result types
export interface StripeValidationResult {
  found: {
    lookupKey: string;
    priceId: string;
    active: boolean;
    productName: string | null;
    productActive: boolean;
    unitAmount: number | null;
    currency: string;
    interval: string | null;
  }[];
  missing: string[];
  inactive: string[];
  duplicates: {
    lookupKey: string;
    count: number;
  }[];
  timestamp: string;
}
