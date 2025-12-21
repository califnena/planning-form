/**
 * Billing Plans Configuration
 * 
 * Single source of truth for Stripe products, plan codes, and role mappings.
 * 
 * Access Mapping (per spec):
 * - EFABASIC → access_basic_printables (printable role)
 * - EFAPREMIUM → access_premium_tools + access_basic_printables (premium + printable roles)
 * - EFABINDER → same as EFAPREMIUM (premium + printable roles)
 * - STANDARDSONG → access_song_request (song_standard role)
 * - EFAVIPMONTHLY/EFAVIPYEAR → access_full_platform (vip + premium + printable roles)
 * - EFADOFORU → access_full_platform + access_do_it_for_you (done_for_you + vip + premium + printable roles)
 */

export interface PlanDefinition {
  planCode: string;
  roles: string[];
  name: string;
  description: string;
  isSubscription: boolean;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<string, PlanDefinition> = {
  // Basic subscription - access_basic_printables only
  EFABASIC: {
    planCode: 'basic',
    roles: ['printable'],
    name: 'Basic Pre-Planner',
    description: 'Printable download access',
    isSubscription: true,
    features: [
      'Preview all sections',
      'Generate blank PDFs/Word',
      'Printable download access'
    ]
  },
  
  // Premium subscription - access_premium_tools + access_basic_printables
  EFAPREMIUM: {
    planCode: 'premium',
    roles: ['premium', 'printable'],
    name: 'Premium Tool',
    description: 'Full pre-planning tool access',
    isSubscription: true,
    features: [
      'Generate blank & prefilled forms',
      'Enter & save data (all fields)',
      'Generate filled PDFs',
      'Email plans',
      'Unlimited updates'
    ]
  },
  EFAPREMIUMYEAR: {
    planCode: 'premium',
    roles: ['premium', 'printable'],
    name: 'Premium Tool (Annual)',
    description: 'Full pre-planning tool access',
    isSubscription: true,
    features: [
      'Generate blank & prefilled forms',
      'Enter & save data (all fields)',
      'Generate filled PDFs',
      'Email plans',
      'Unlimited updates'
    ]
  },
  
  // VIP subscriptions - access_full_platform (includes everything)
  EFAVIPYEAR: {
    planCode: 'vip_annual',
    roles: ['vip', 'premium', 'printable'],
    name: 'Compassionate Guidance (Annual)',
    description: 'Full platform access + compassionate guidance',
    isSubscription: true,
    features: [
      'Everything in Premium',
      '24/7 guided planning & coping coach (AI-powered)',
      'Full platform access'
    ]
  },
  EFAVIPMONTHLY: {
    planCode: 'vip_monthly',
    roles: ['vip', 'premium', 'printable'],
    name: 'Compassionate Guidance (Monthly)',
    description: 'Full platform access + compassionate guidance',
    isSubscription: true,
    features: [
      'Everything in Premium (monthly access)',
      '24/7 guided planning & coping coach (AI-powered)',
      'Full platform access'
    ]
  },
  
  // One-time products
  
  // EFADOFORU - access_full_platform + access_do_it_for_you
  EFADOFORU: {
    planCode: 'done_for_you',
    roles: ['done_for_you', 'vip', 'premium', 'printable'],
    name: 'Do It For You',
    description: 'Full platform access + personalized 1:1 virtual session',
    isSubscription: false,
    features: [
      'Full platform access (everything)',
      '1:1 virtual interview & walkthrough',
      'We complete your forms for you',
      'Fireproof binder included',
      'Finalized digital copy ready to print'
    ]
  },
  
  // EFABINDER - same as EFAPREMIUM (access_premium_tools + access_basic_printables)
  EFABINDER: {
    planCode: 'binder',
    roles: ['premium', 'printable'],
    name: 'Fireproof Binder',
    description: 'Physical binder + Premium tool access',
    isSubscription: false,
    features: [
      'Physical fireproof binder (ships separately)',
      'Full Premium tool access included',
      'Print + pre-planning tool access'
    ]
  },
  
  // Custom songs - access_song_request only
  STANDARDSONG: {
    planCode: 'song_standard',
    roles: ['song_standard'],
    name: 'Standard Memorial Song',
    description: 'Custom memorial song creation',
    isSubscription: false,
    features: ['Custom memorial song', 'Access to submit song request']
  },
  STRIPE_STANDARD_SONG_PRICE_ID: {
    planCode: 'song_standard',
    roles: ['song_standard'],
    name: 'Standard Memorial Song',
    description: 'Custom memorial song creation',
    isSubscription: false,
    features: ['Custom memorial song', 'Access to submit song request']
  },
  STRIPE_PREMIUM_SONG_PRICE_ID: {
    planCode: 'song_premium',
    roles: ['song_premium'],
    name: 'Premium Memorial Song',
    description: 'Premium custom memorial song creation',
    isSubscription: false,
    features: ['Premium custom memorial song with enhanced production']
  },
};

/**
 * Get plan definition by lookup key
 */
export function getPlanByLookupKey(lookupKey: string): PlanDefinition | undefined {
  return PLAN_DEFINITIONS[lookupKey];
}

/**
 * Get roles for a given lookup key
 */
export function getRolesForLookupKey(lookupKey: string): string[] {
  return PLAN_DEFINITIONS[lookupKey]?.roles || [];
}

/**
 * Get plan code for a given lookup key
 */
export function getPlanCodeForLookupKey(lookupKey: string): string | undefined {
  return PLAN_DEFINITIONS[lookupKey]?.planCode;
}

/**
 * Get human-readable plan name for display
 */
export function getPlanDisplayName(planCode: string): string {
  const plan = Object.values(PLAN_DEFINITIONS).find(p => p.planCode === planCode);
  return plan?.name || planCode;
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(planCode: string): string[] {
  const plan = Object.values(PLAN_DEFINITIONS).find(p => p.planCode === planCode);
  return plan?.features || [];
}

/**
 * Map lookup key to access flags (for logging/debugging)
 */
export function mapAccessFromLookupKey(lookupKey: string): {
  access_basic_printables: boolean;
  access_premium_tools: boolean;
  access_song_request: boolean;
  access_full_platform: boolean;
  access_do_it_for_you: boolean;
} {
  const roles = getRolesForLookupKey(lookupKey);
  
  return {
    access_basic_printables: roles.includes('printable'),
    access_premium_tools: roles.includes('premium') || roles.includes('vip') || roles.includes('done_for_you'),
    access_song_request: roles.includes('song_standard') || roles.includes('song_premium'),
    access_full_platform: roles.includes('vip') || roles.includes('done_for_you'),
    access_do_it_for_you: roles.includes('done_for_you'),
  };
}