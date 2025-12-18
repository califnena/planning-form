import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrgRole = "owner" | "admin" | "member" | "executor" | "vip";
const VALID_ROLES: OrgRole[] = ["owner", "admin", "member", "executor", "vip"];

interface AdminUser {
  userId: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  displayName: string | null;
  orgRole: OrgRole | null;
  orgId: string;
}

function ok<T>(data: T) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(error: string, status = 400, details?: unknown) {
  console.error("Admin error:", error, details);
  return new Response(JSON.stringify({ ok: false, error, details }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return err("Server not configured", 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return err("Unauthorized", 401);
    }

    // User client for RLS-protected queries
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return err("Unauthorized", 401);
    }

    const payload = await req.json();
    const { action, orgId, userId, email, role } = payload;

    if (!orgId) {
      return err("orgId is required");
    }

    // Verify caller is admin/owner in this org (uses RLS)
    const { data: callerMembership, error: membershipErr } = await userClient
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipErr) {
      return err("Authorization check failed", 500, membershipErr.message);
    }

    if (!callerMembership || !["owner", "admin"].includes(callerMembership.role)) {
      return err("Forbidden: Admin access required", 403);
    }

    // Service client for admin operations (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if target user is app owner (protected from destructive actions)
    async function isAppOwner(targetUserId: string): Promise<boolean> {
      const { data } = await serviceClient
        .from("app_owner")
        .select("user_id")
        .eq("user_id", targetUserId)
        .maybeSingle();
      return !!data;
    }

    switch (action) {
      case "list_org_users": {
        // Get all org members
        const { data: members, error: membersErr } = await serviceClient
          .from("org_members")
          .select("user_id, role, created_at")
          .eq("org_id", orgId);

        if (membersErr) {
          return err("Failed to list members", 500, membersErr.message);
        }

        if (!members || members.length === 0) {
          return ok([]);
        }

        // Get auth users for email/metadata
        const { data: authData, error: authErr } = await serviceClient.auth.admin.listUsers();
        if (authErr) {
          return err("Failed to get user details", 500, authErr.message);
        }

        const authUsersMap = new Map(
          authData.users.map((u) => [
            u.id,
            {
              email: u.email,
              createdAt: u.created_at,
              lastSignInAt: u.last_sign_in_at,
            },
          ])
        );

        // Get profiles for display names
        const userIds = members.map((m) => m.user_id);
        const { data: profiles } = await serviceClient
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profilesMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

        const users: AdminUser[] = members.map((m) => {
          const auth = authUsersMap.get(m.user_id);
          return {
            userId: m.user_id,
            email: auth?.email || null,
            createdAt: auth?.createdAt || m.created_at,
            lastSignInAt: auth?.lastSignInAt || null,
            displayName: profilesMap.get(m.user_id) || null,
            orgRole: m.role as OrgRole,
            orgId,
          };
        });

        return ok(users);
      }

      case "set_org_role": {
        if (!userId || !role) {
          return err("userId and role are required");
        }

        if (!VALID_ROLES.includes(role as OrgRole)) {
          return err(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
        }

        // Protect app owner from demotion
        if (await isAppOwner(userId)) {
          if (role !== "owner" && role !== "admin") {
            return err("Cannot demote app owner below admin", 403);
          }
        }

        // Prevent last owner from being demoted
        if (role !== "owner") {
          const { data: owners } = await serviceClient
            .from("org_members")
            .select("user_id")
            .eq("org_id", orgId)
            .eq("role", "owner");

          if (owners?.length === 1 && owners[0].user_id === userId) {
            return err("Cannot demote the only owner of the organization");
          }
        }

        const { error: updateErr } = await serviceClient
          .from("org_members")
          .update({ role })
          .eq("org_id", orgId)
          .eq("user_id", userId);

        if (updateErr) {
          return err("Failed to update role", 500, updateErr.message);
        }

        console.log(`Updated user ${userId} role to ${role} in org ${orgId}`);
        return ok({ success: true });
      }

      case "add_existing_user_to_org": {
        if (!email || !role) {
          return err("email and role are required");
        }

        if (!VALID_ROLES.includes(role as OrgRole)) {
          return err(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
        }

        // Find user by email
        const { data: authData, error: authErr } = await serviceClient.auth.admin.listUsers();
        if (authErr) {
          return err("Failed to lookup user", 500, authErr.message);
        }

        const targetUser = authData.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!targetUser) {
          return err("No user found with this email. They need to create an account first.", 404);
        }

        // Check if already a member
        const { data: existing } = await serviceClient
          .from("org_members")
          .select("user_id")
          .eq("org_id", orgId)
          .eq("user_id", targetUser.id)
          .maybeSingle();

        if (existing) {
          return err("User is already a member of this organization");
        }

        const { error: insertErr } = await serviceClient.from("org_members").insert({
          org_id: orgId,
          user_id: targetUser.id,
          role,
        });

        if (insertErr) {
          return err("Failed to add member", 500, insertErr.message);
        }

        console.log(`Added user ${email} to org ${orgId} with role ${role}`);
        return ok({ success: true, userId: targetUser.id });
      }

      case "block_user": {
        if (!userId) {
          return err("userId is required");
        }

        if (await isAppOwner(userId)) {
          return err("Cannot block app owner", 403);
        }

        // Verify target is in this org
        const { data: membership } = await serviceClient
          .from("org_members")
          .select("user_id")
          .eq("org_id", orgId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!membership) {
          return err("User is not a member of this organization", 404);
        }

        const { error: banErr } = await serviceClient.auth.admin.updateUserById(userId, {
          ban_duration: "876000h", // ~100 years
        });

        if (banErr) {
          return err("Failed to block user", 500, banErr.message);
        }

        console.log(`Blocked user ${userId}`);
        return ok({ success: true });
      }

      case "unblock_user": {
        if (!userId) {
          return err("userId is required");
        }

        // Verify target is in this org
        const { data: membership } = await serviceClient
          .from("org_members")
          .select("user_id")
          .eq("org_id", orgId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!membership) {
          return err("User is not a member of this organization", 404);
        }

        const { error: unbanErr } = await serviceClient.auth.admin.updateUserById(userId, {
          ban_duration: "none",
        });

        if (unbanErr) {
          return err("Failed to unblock user", 500, unbanErr.message);
        }

        console.log(`Unblocked user ${userId}`);
        return ok({ success: true });
      }

      case "remove_from_org": {
        if (!userId) {
          return err("userId is required");
        }

        if (await isAppOwner(userId)) {
          return err("Cannot remove app owner from organization", 403);
        }

        // Prevent removing the only owner
        const { data: owners } = await serviceClient
          .from("org_members")
          .select("user_id, role")
          .eq("org_id", orgId)
          .eq("role", "owner");

        if (owners?.length === 1 && owners[0].user_id === userId) {
          return err("Cannot remove the only owner of the organization");
        }

        const { error: deleteErr } = await serviceClient
          .from("org_members")
          .delete()
          .eq("org_id", orgId)
          .eq("user_id", userId);

        if (deleteErr) {
          return err("Failed to remove member", 500, deleteErr.message);
        }

        console.log(`Removed user ${userId} from org ${orgId}`);
        return ok({ success: true });
      }

      default:
        return err(`Unknown action: ${action}`);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return err(msg, 500);
  }
});
