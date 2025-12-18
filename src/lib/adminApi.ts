import { supabase } from "@/integrations/supabase/client";

export type OrgRole = "owner" | "admin" | "member" | "executor" | "vip";

export type AdminUser = {
  userId: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  displayName?: string | null;
  orgRole?: OrgRole | null;
  orgId?: string | null;
};

export interface UserAdminMeta {
  user_id: string;
  tags: string[];
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

type AdminFnResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown };

async function callAdminFn<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<AdminFnResponse<T>>(
    "admin-user-management",
    { body: payload }
  );

  if (error) {
    throw new Error(`Edge Function error: ${error.message}`);
  }

  if (!data) {
    throw new Error("Edge Function returned no data.");
  }

  if (!data.ok) {
    const errorData = data as { ok: false; error: string };
    throw new Error(errorData.error || "Admin function failed.");
  }

  return data.data;
}

/**
 * Returns all members in this org + their org role,
 * joined with auth user email/name so the admin panel matches the workspace.
 */
export async function adminListOrgUsers(orgId: string): Promise<AdminUser[]> {
  return await callAdminFn<AdminUser[]>({
    action: "list_org_users",
    orgId,
  });
}

/**
 * Promote/demote an existing user in the org.
 * This is the correct replacement for "Assign Admin Role".
 */
export async function adminSetOrgRole(params: {
  orgId: string;
  userId: string;
  role: OrgRole;
}): Promise<{ success: true }> {
  const { orgId, userId, role } = params;

  return await callAdminFn<{ success: true }>({
    action: "set_org_role",
    orgId,
    userId,
    role,
  });
}

/**
 * Add an existing user to the org by email.
 * This does NOT "invite" unless they don't exist. It finds the user by email and adds to org_members.
 */
export async function adminAddExistingUserToOrg(params: {
  orgId: string;
  email: string;
  role: OrgRole;
}): Promise<{ success: true; userId: string }> {
  const { orgId, email, role } = params;

  return await callAdminFn<{ success: true; userId: string }>({
    action: "add_existing_user_to_org",
    orgId,
    email,
    role,
  });
}

/**
 * Block a user (ban them from signing in)
 */
export async function blockUser(orgId: string, userId: string): Promise<{ success: true }> {
  return await callAdminFn<{ success: true }>({
    action: "block_user",
    orgId,
    userId,
  });
}

/**
 * Unblock a user (allow them to sign in again)
 */
export async function unblockUser(orgId: string, userId: string): Promise<{ success: true }> {
  return await callAdminFn<{ success: true }>({
    action: "unblock_user",
    orgId,
    userId,
  });
}

/**
 * Remove a user from the org (delete their org_members row)
 */
export async function removeUserFromOrg(orgId: string, userId: string): Promise<{ success: true }> {
  return await callAdminFn<{ success: true }>({
    action: "remove_from_org",
    orgId,
    userId,
  });
}

/**
 * Get admin meta for a specific user
 */
export async function getUserAdminMeta(userId: string): Promise<UserAdminMeta | null> {
  const { data, error } = await supabase
    .from("user_admin_meta")
    .select("*")
    .eq("user_id", userId)
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
  const { error } = await supabase
    .from("user_admin_meta")
    .upsert({
      user_id: userId,
      ...meta,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Log a user login
 */
export async function logUserLogin(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase.from("user_logins").insert({
      user_id: userId,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (error) {
    console.error("Failed to log user login:", error);
  }
}

/**
 * Get current user's org membership (for determining which org to manage)
 */
export async function getCurrentUserOrg(): Promise<{ orgId: string; role: OrgRole } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { orgId: data.org_id, role: data.role as OrgRole };
}

/**
 * Check if current user is an admin in their org
 */
export async function checkIsOrgAdmin(): Promise<boolean> {
  const org = await getCurrentUserOrg();
  if (!org) return false;
  return ["owner", "admin"].includes(org.role);
}
