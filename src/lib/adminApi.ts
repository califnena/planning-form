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
  is_blocked: boolean;
  banned_until: string | null;
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

  // Get login stats
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

  // Get user entitlement roles from app_roles/user_roles (subscription-based)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role_id');

  const { data: allRoles } = await supabase
    .from('app_roles')
    .select('id, name');

  const roleMap = new Map(allRoles?.map(r => [r.id, r.name]) || []);
  
  // Build user entitlement roles map
  const userEntitlementsMap = new Map<string, string[]>();
  userRoles?.forEach(ur => {
    const roleName = roleMap.get(ur.role_id);
    if (roleName) {
      const existing = userEntitlementsMap.get(ur.user_id) || [];
      existing.push(roleName);
      userEntitlementsMap.set(ur.user_id, existing);
    }
  });

  // Get org_members for workspace roles (admin, owner, member, executor, vip)
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('user_id, role, org_id');

  // Build org roles map - combine all org roles for each user
  const orgRolesMap = new Map<string, string[]>();
  orgMembers?.forEach(om => {
    const existing = orgRolesMap.get(om.user_id) || [];
    if (!existing.includes(om.role)) {
      existing.push(om.role);
    }
    orgRolesMap.set(om.user_id, existing);
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

  // Get auth user data from edge function for emails and banned status
  let authUsersMap = new Map<string, { email: string; banned_until: string | null }>();
  try {
    const { data: authData, error: authError } = await supabase.functions.invoke('admin-user-management', {
      body: { action: 'get_users' }
    });
    if (!authError && authData?.users) {
      authUsersMap = new Map(authData.users.map((u: any) => [u.id, { email: u.email, banned_until: u.banned_until }]));
    }
  } catch (e) {
    console.error('Failed to fetch auth users:', e);
  }

  const users: AdminUser[] = [];

  for (const profile of profiles || []) {
    const loginStat = loginStatsMap.get(profile.id);
    const sub = subscriptionMap.get(profile.id);
    const authUser = authUsersMap.get(profile.id);
    const bannedUntil = authUser?.banned_until || null;
    
    // Combine entitlement roles with org roles, prioritizing org roles if present
    const entitlementRoles = userEntitlementsMap.get(profile.id) || [];
    const orgRoles = orgRolesMap.get(profile.id) || [];
    const combinedRoles = [...new Set([...orgRoles, ...entitlementRoles])];
    
    users.push({
      id: profile.id,
      email: authUser?.email || profile.full_name || 'Unknown',
      created_at: profile.created_at,
      login_count: loginStat?.count || 0,
      last_login_at: loginStat?.lastLogin || null,
      roles: combinedRoles,
      active_plan: sub?.status === 'active' ? sub.plan_type : null,
      plan_status: sub?.status || null,
      plan_renews_at: sub?.current_period_end || null,
      is_owner: ownerSet.has(profile.id),
      is_blocked: bannedUntil ? new Date(bannedUntil) > new Date() : false,
      banned_until: bannedUntil,
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

/**
 * Block a user (set banned_until to far future)
 */
export async function blockUser(userId: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase.functions.invoke('admin-user-management', {
    body: { action: 'block', targetUserId: userId }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

/**
 * Unblock a user (clear banned_until)
 */
export async function unblockUser(userId: string): Promise<void> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase.functions.invoke('admin-user-management', {
    body: { action: 'unblock', targetUserId: userId }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

/**
 * Invite a new user by email
 */
export async function inviteUser(email: string): Promise<string | undefined> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized: Admin access required');

  const { data, error } = await supabase.functions.invoke('admin-user-management', {
    body: { action: 'invite', email }
  });

  // Extract server error from various possible locations
  const serverError =
    data?.error ||
    (error as any)?.context?.error ||
    error?.message;

  // Check for errors from either the function invocation or the response data
  if (error || data?.error) {
    throw new Error(serverError || 'Failed to invite user');
  }
  
  return data?.userId;
}
