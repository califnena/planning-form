/**
 * Unified Access Check Functions
 * 
 * All access checks go through the role system (user_roles + app_roles tables).
 * The stripe-webhook edge function grants roles when payments complete.
 * 
 * Permission Flags (based on Stripe lookup key):
 * - access_basic_printables: Can download printable PDFs
 * - access_premium_tools: Full pre-planning tool access + printables
 * - access_song_request: Can submit custom song request
 * - access_full_platform: Full platform access (VIP)
 * - access_do_it_for_you: Do-It-For-You workflow access
 * 
 * Grant Rules:
 * - EFABASIC → access_basic_printables
 * - EFAPREMIUM → access_premium_tools + access_basic_printables
 * - EFABINDER → same as EFAPREMIUM (premium tools + printables)
 * - STANDARDSONG → access_song_request
 * - EFAVIPMONTHLY/EFAVIPYEAR → access_full_platform (includes everything)
 * - EFADOFORU → access_full_platform + access_do_it_for_you
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
 * Check if user has access to basic printables (EFABASIC or higher)
 */
export async function checkBasicPrintablesAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for printable role (granted by EFABASIC, EFAPREMIUM, EFABINDER, VIP, DOFORU)
  const { data: hasPrintable } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'printable' });
  
  return !!hasPrintable;
}

/**
 * Check if user has access to premium tools (EFAPREMIUM, EFABINDER, or higher)
 */
export async function checkPremiumToolsAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for premium role (granted by EFAPREMIUM, EFABINDER)
  const { data: hasPremium } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'premium' });
  if (hasPremium) return true;

  // VIP includes premium
  const { data: hasVip } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'vip' });
  if (hasVip) return true;

  // Done for you includes full platform
  const { data: hasDfy } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'done_for_you' });
  if (hasDfy) return true;

  return false;
}

/**
 * Check if user has song request access (STANDARDSONG)
 */
export async function checkSongRequestAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for song roles
  const { data: hasSongStandard } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'song_standard' });
  if (hasSongStandard) return true;

  const { data: hasSongPremium } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'song_premium' });
  if (hasSongPremium) return true;

  return false;
}

/**
 * Check if user has full platform access (VIP or DOFORU)
 */
export async function checkFullPlatformAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  // Check for VIP role (granted by EFAVIPMONTHLY, EFAVIPYEAR)
  const { data: hasVip } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'vip' });
  if (hasVip) return true;

  // Check for done_for_you role (granted by EFADOFORU)
  const { data: hasDfy } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'done_for_you' });
  if (hasDfy) return true;

  return false;
}

/**
 * Check if user has Do-It-For-You access (EFADOFORU)
 */
export async function checkDoItForYouAccess(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin bypasses all checks
  const { data: isAdmin } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasRole } = await supabase
    .rpc('has_app_role', { _user_id: user.id, _role: 'done_for_you' });
  
  return !!hasRole;
}

// ============ Legacy compatibility functions ============

/**
 * @deprecated Use checkPremiumToolsAccess() instead
 * Check if user has any paid access (basic, vip, or done_for_you)
 */
export async function checkPaidAccess(): Promise<boolean> {
  return checkPremiumToolsAccess();
}

/**
 * @deprecated Use checkFullPlatformAccess() instead
 * Check if user has VIP access (VIP Coach and premium features)
 */
export async function checkVIPAccess(): Promise<boolean> {
  return checkFullPlatformAccess();
}

/**
 * @deprecated Use checkBasicPrintablesAccess() instead
 * Check if user has printable workbook access
 */
export async function checkPrintableAccess(): Promise<boolean> {
  return checkBasicPrintablesAccess();
}

/**
 * Check if user is on free plan (no paid roles)
 */
export async function checkIsFreePlan(): Promise<boolean> {
  const hasPaid = await checkBasicPrintablesAccess();
  return !hasPaid;
}

/**
 * @deprecated Use checkSongRequestAccess() instead
 */
export async function checkSongStandardAccess(): Promise<boolean> {
  return checkSongRequestAccess();
}

/**
 * @deprecated Use checkSongRequestAccess() instead
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
 * @deprecated Use checkDoItForYouAccess() instead
 */
export async function checkDoneForYouAccess(): Promise<boolean> {
  return checkDoItForYouAccess();
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

/**
 * Get all access flags for current user (useful for debugging/UI)
 */
export async function getUserAccessFlags(): Promise<{
  access_basic_printables: boolean;
  access_premium_tools: boolean;
  access_song_request: boolean;
  access_full_platform: boolean;
  access_do_it_for_you: boolean;
  is_admin: boolean;
}> {
  const [printables, premium, song, fullPlatform, dify, admin] = await Promise.all([
    checkBasicPrintablesAccess(),
    checkPremiumToolsAccess(),
    checkSongRequestAccess(),
    checkFullPlatformAccess(),
    checkDoItForYouAccess(),
    checkAdminAccess(),
  ]);

  return {
    access_basic_printables: printables,
    access_premium_tools: premium,
    access_song_request: song,
    access_full_platform: fullPlatform,
    access_do_it_for_you: dify,
    is_admin: admin,
  };
}