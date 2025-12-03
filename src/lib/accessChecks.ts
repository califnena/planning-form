/**
 * Unified Access Check Functions
 * 
 * All access checks go through the role system (user_roles + app_roles tables).
 * The stripe-webhook edge function grants roles when payments complete.
 * 
 * Role hierarchy:
 * - admin: Full access to everything (bypasses all checks)
 * - vip: VIP Coach + premium features + printable
 * - basic: Standard paid access + printable
 * - printable: Access to printable workbook downloads
 * - done_for_you: Do It For You service access
 * - song_standard: Standard custom song access
 * - song_premium: Premium custom song access
 * - binder: Physical binder purchase tracking
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Check if user has admin role (bypasses all paywalls)
 */
export async function checkAdminAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  
  return !!isAdmin;
}

/**
 * Check if user has any paid access (basic, vip, or done_for_you)
 * This is the main check for accessing the planner features.
 */
export async function checkPaidAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for basic role
  const { data: hasBasic } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'basic' });
  if (hasBasic) return true;

  // Check for VIP role
  const { data: hasVip } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'vip' });
  if (hasVip) return true;

  // Check for done_for_you role
  const { data: hasDfy } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'done_for_you' });
  if (hasDfy) return true;

  return false;
}

/**
 * Check if user has VIP access (VIP Coach and premium features)
 */
export async function checkVIPAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for VIP role using has_vip_access RPC (checks both admin and vip roles)
  const { data: hasVip } = await supabase
    .rpc('has_vip_access', { _user_id: user.id });
  
  return !!hasVip;
}

/**
 * Check if user has printable workbook access
 */
export async function checkPrintableAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for printable role
  const { data: hasPrintable } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'printable' });
  if (hasPrintable) return true;

  // VIP also includes printable access
  const { data: hasVip } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'vip' });
  if (hasVip) return true;

  return false;
}

/**
 * Check if user is on free plan (no paid roles)
 */
export async function checkIsFreePlan(): Promise<boolean> {
  const hasPaid = await checkPaidAccess();
  return !hasPaid;
}

/**
 * Check if user has song standard access
 */
export async function checkSongStandardAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasRole } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'song_standard' });
  
  return !!hasRole;
}

/**
 * Check if user has song premium access
 */
export async function checkSongPremiumAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasRole } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'song_premium' });
  
  return !!hasRole;
}

/**
 * Check if user has done_for_you access
 */
export async function checkDoneForYouAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasRole } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'done_for_you' });
  
  return !!hasRole;
}

/**
 * Check if user has a specific role
 */
export async function checkHasRole(role: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin always has all roles
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasRole } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: role });
  
  return !!hasRole;
}
