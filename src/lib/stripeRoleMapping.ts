/**
 * Stripe Lookup Key to Role Mapping
 * 
 * This is the single source of truth for mapping Stripe products/prices
 * to application roles. When a user completes a Stripe checkout, the
 * stripe-webhook edge function uses this mapping to grant the appropriate roles.
 * 
 * To add a new product:
 * 1. Create the price in Stripe with a lookup_key
 * 2. Add the lookup_key to STRIPE_LOOKUP_KEYS in stripeLookupKeys.ts
 * 3. Add the role to app_roles table if needed
 * 4. Add the mapping here
 */

export const STRIPE_TO_ROLES_MAP: Record<string, string[]> = {
  // Basic subscription - grants basic + printable access
  'EFABASIC': ['basic', 'printable'],
  
  // Premium subscription - grants basic + vip + printable
  'EFAPREMIUM': ['basic', 'vip', 'printable'],
  'EFAPREMIUMYEAR': ['basic', 'vip', 'printable'],
  
  // VIP subscriptions - grants vip + printable
  'EFAVIPYEAR': ['vip', 'printable'],
  'EFAVIPMONTHLY': ['vip', 'printable'],
  
  // One-time products
  'EFADOFORU': ['done_for_you', 'basic', 'printable'], // Do It For You includes basic access
  'EFABINDER': ['binder'],
  
  // Custom songs
  'STANDARDSONG': ['song_standard'],
  'PREMIUMSONG': ['song_premium'],
};

/**
 * Get roles that should be granted for a given Stripe lookup key
 */
export function getRolesForLookupKey(lookupKey: string): string[] {
  return STRIPE_TO_ROLES_MAP[lookupKey] || [];
}

/**
 * Check if a lookup key grants a specific role
 */
export function lookupKeyGrantsRole(lookupKey: string, role: string): boolean {
  const roles = STRIPE_TO_ROLES_MAP[lookupKey] || [];
  return roles.includes(role);
}
