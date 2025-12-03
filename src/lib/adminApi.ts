import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  login_count: number;
  last_login_at: string | null;
  roles: string[];
  active_plan: string | null;
  plan_status: string | null;
  plan_renews_at: string | null;
  is_owner: boolean;
}

export interface UserAdminMeta {
  user_id: string;
  tags: string[];
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppRole {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Built-in roles that cannot be deleted
export const PROTECTED_ROLES = ['admin', 'vip', 'basic', 'printable', 'song_standard', 'song_premium', 'done_for_you', 'binder'];

/**
 * Check if current user is admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase.rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
  return data === true;
}

/**
 * List all users with basic info, login stats, roles, and subscription status
 */
export async function listUsers(): Promise<AdminUser[]> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  // Get all profiles (which links to auth.users)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, created_at');
  
  if (profilesError) throw profilesError;

  // Get login stats - use raw query since view may not be in types
  const { data: loginStats } = await supabase
    .from('user_logins')
    .select('user_id, logged_in_at');

  // Aggregate login stats manually
  const loginStatsMap = new Map<string, { count: number; lastLogin: string | null }>();
  loginStats?.forEach(login => {
    const existing = loginStatsMap.get(login.user_id);
    if (existing) {
      existing.count++;
      if (login.logged_in_at > (existing.lastLogin || '')) {
        existing.lastLogin = login.logged_in_at;
      }
    } else {
      loginStatsMap.set(login.user_id, { count: 1, lastLogin: login.logged_in_at });
    }
  });

  // Get user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role_id');

  // Get all roles
  const { data: allRoles } = await supabase
    .from('app_roles')
    .select('id, name');

  const roleMap = new Map(allRoles?.map(r => [r.id, r.name]) || []);
  
  // Build user roles map
  const userRolesMap = new Map<string, string[]>();
  userRoles?.forEach(ur => {
    const roleName = roleMap.get(ur.role_id);
    if (roleName) {
      const existing = userRolesMap.get(ur.user_id) || [];
      existing.push(roleName);
      userRolesMap.set(ur.user_id, existing);
    }
  });

  // Get subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, plan_type, status, current_period_end');

  const subscriptionMap = new Map(
    subscriptions?.map(s => [s.user_id, s]) || []
  );

  // Get app owners
  const { data: owners } = await supabase
    .from('app_owner')
    .select('user_id');
  
  const ownerSet = new Set(owners?.map(o => o.user_id) || []);

  // Get user emails from auth (need to use service role or edge function)
  // For now, we'll use the profiles table and note that email needs edge function
  const users: AdminUser[] = [];

  for (const profile of profiles || []) {
    const loginStat = loginStatsMap.get(profile.id);
    const sub = subscriptionMap.get(profile.id);
    
    users.push({
      id: profile.id,
      email: profile.full_name || 'Unknown', // Will be replaced by edge function
      created_at: profile.created_at,
      login_count: loginStat?.count || 0,
      last_login_at: loginStat?.lastLogin || null,
      roles: userRolesMap.get(profile.id) || [],
      active_plan: sub?.status === 'active' ? sub.plan_type : null,
      plan_status: sub?.status || null,
      plan_renews_at: sub?.current_period_end || null,
      is_owner: ownerSet.has(profile.id),
    });
  }

  return users;
}

/**
 * Get admin meta for a specific user
 */
export async function getUserAdminMeta(userId: string): Promise<UserAdminMeta | null> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase
    .from('user_admin_meta')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Update admin meta for a user
 */
export async function updateUserAdminMeta(
  userId: string,
  meta: { tags?: string[]; notes?: string; last_contacted_at?: string | null }
): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { error } = await supabase
    .from('user_admin_meta')
    .upsert({
      user_id: userId,
      ...meta,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Get all roles
 */
export async function listRoles(): Promise<AppRole[]> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase
    .from('app_roles')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Add a role to a user
 */
export async function addUserRole(userId: string, roleName: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  // Get role id
  const { data: role, error: roleError } = await supabase
    .from('app_roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError || !role) throw new Error(`Role ${roleName} not found`);

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' });

  if (error) throw error;
}

/**
 * Remove a role from a user (with owner protection)
 */
export async function removeUserRole(userId: string, roleName: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  // Check if user is owner and trying to remove admin
  if (roleName === 'admin') {
    const { data: isOwner } = await supabase.rpc('is_app_owner', { _user_id: userId });
    if (isOwner) {
      throw new Error('Cannot remove admin role from app owner');
    }
  }

  // Get role id
  const { data: role, error: roleError } = await supabase
    .from('app_roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError || !role) throw new Error(`Role ${roleName} not found`);

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', role.id);

  if (error) throw error;
}

/**
 * Create a new role
 */
export async function createRole(name: string, description?: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { error } = await supabase
    .from('app_roles')
    .insert({ name, description });

  if (error) throw error;
}

/**
 * Update a role description
 */
export async function updateRole(roleId: string, description: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { error } = await supabase
    .from('app_roles')
    .update({ description })
    .eq('id', roleId);

  if (error) throw error;
}

/**
 * Delete a role (with protection for built-in roles)
 */
export async function deleteRole(roleId: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  // Check if it's a protected role
  const { data: role } = await supabase
    .from('app_roles')
    .select('name')
    .eq('id', roleId)
    .single();

  if (role && PROTECTED_ROLES.includes(role.name)) {
    throw new Error(`Cannot delete built-in role: ${role.name}`);
  }

  const { error } = await supabase
    .from('app_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
}

/**
 * Get subscription statistics for billing tab
 */
export async function getSubscriptionStats(): Promise<{
  total: number;
  byPlan: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('plan_type, status');

  if (error) throw error;

  const byPlan: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  subscriptions?.forEach(sub => {
    byPlan[sub.plan_type] = (byPlan[sub.plan_type] || 0) + 1;
    byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
  });

  return {
    total: subscriptions?.length || 0,
    byPlan,
    byStatus,
  };
}

/**
 * List all subscriptions for admin view
 */
export async function listSubscriptions(): Promise<Array<{
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}>> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_type, status, current_period_end, cancel_at_period_end')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Log a user login
 */
export async function logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
  try {
    await supabase
      .from('user_logins')
      .insert({
        user_id: userId,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      });
  } catch (error) {
    // Don't block login if logging fails
    console.error('Failed to log user login:', error);
  }
}
