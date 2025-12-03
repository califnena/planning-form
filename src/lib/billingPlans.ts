/**
 * Billing Plans Configuration
 * 
 * Single source of truth for Stripe products, plan codes, and role mappings.
 * Used by:
 * - Stripe webhook to grant roles and update subscriptions
 * - Billing UI to display plan information
 * - Access checks throughout the app
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
  // Basic subscription
  EFABASIC: {
    planCode: 'basic',
    roles: ['basic', 'printable'],
    name: 'Basic (Annual)',
    description: 'Preview all sections, generate blank PDFs',
    isSubscription: true,
    features: [
      'Preview all sections',
      'Generate blank PDFs/Word',
      'View-only access (no saved data)'
    ]
  },
  
  // Premium subscription
  EFAPREMIUM: {
    planCode: 'premium',
    roles: ['basic', 'vip', 'printable'],
    name: 'Premium',
    description: 'Full access to planning toolkit',
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
    roles: ['basic', 'vip', 'printable'],
    name: 'Premium (Annual)',
    description: 'Full access to planning toolkit',
    isSubscription: true,
    features: [
      'Generate blank & prefilled forms',
      'Enter & save data (all fields)',
      'Generate filled PDFs',
      'Email plans',
      'Unlimited updates'
    ]
  },
  
  // VIP subscriptions
  EFAVIPYEAR: {
    planCode: 'vip_annual',
    roles: ['vip', 'printable'],
    name: 'VIP (Annual)',
    description: '24/7 guided planning & coping coach',
    isSubscription: true,
    features: [
      'Everything in Premium',
      '24/7 guided planning & coping coach (AI-powered)'
    ]
  },
  EFAVIPMONTHLY: {
    planCode: 'vip_monthly',
    roles: ['vip', 'printable'],
    name: 'VIP (Monthly)',
    description: '24/7 guided planning & coping coach',
    isSubscription: true,
    features: [
      'Everything in Premium (monthly access)',
      '24/7 guided planning & coping coach (AI-powered)'
    ]
  },
  
  // One-time products
  EFADOFORU: {
    planCode: 'done_for_you',
    roles: ['done_for_you', 'basic', 'printable'],
    name: 'Do It For You',
    description: 'Personalized 1:1 virtual session',
    isSubscription: false,
    features: [
      '1:1 virtual interview & walkthrough',
      'We complete your forms for you',
      'Fireproof binder included',
      'Finalized digital copy ready to print'
    ]
  },
  EFABINDER: {
    planCode: 'binder',
    roles: ['binder'],
    name: 'Fireproof Binder',
    description: 'Physical fireproof binder for printed plan',
    isSubscription: false,
    features: ['Physical fireproof binder for printed plan (ships separately)']
  },
  
  // Custom songs
  STRIPE_STANDARD_SONG_PRICE_ID: {
    planCode: 'song_standard',
    roles: ['song_standard'],
    name: 'Standard Memorial Song',
    description: 'Custom memorial song creation',
    isSubscription: false,
    features: ['Custom memorial song']
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
