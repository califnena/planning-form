import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing required environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to check admin status
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user client to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await userClient.rpc("has_app_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role for auth operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, targetUserId, email, role, orgId } = await req.json();
    
    // Default org ID
    const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
    const effectiveOrgId = orgId || DEFAULT_ORG_ID;

    // Check if target is app owner (protected)
    if (targetUserId) {
      const { data: isOwner } = await userClient.rpc("is_app_owner", {
        _user_id: targetUserId,
      });

      if (isOwner && (action === "block" || action === "delete")) {
        return new Response(
          JSON.stringify({ error: "Cannot modify app owner account" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let result;

    switch (action) {
      case "block":
        // Set banned_until to 100 years from now
        const banDate = new Date();
        banDate.setFullYear(banDate.getFullYear() + 100);
        
        const { error: blockError } = await adminClient.auth.admin.updateUserById(
          targetUserId,
          { ban_duration: "876000h" } // ~100 years in hours
        );
        
        if (blockError) throw blockError;
        result = { success: true, message: "User blocked" };
        break;

      case "unblock":
        const { error: unblockError } = await adminClient.auth.admin.updateUserById(
          targetUserId,
          { ban_duration: "none" }
        );
        
        if (unblockError) throw unblockError;
        result = { success: true, message: "User unblocked" };
        break;

      case "add_member":
        // Add an existing user to org_members by email
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Look up user by email using admin API
        const { data: authUsers, error: lookupError } = await adminClient.auth.admin.listUsers();
        if (lookupError) throw lookupError;
        
        const targetUser = authUsers.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        
        if (!targetUser) {
          return new Response(
            JSON.stringify({ error: "No user found with this email. They need to create an account first." }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate role
        const validRoles = ['owner', 'admin', 'member', 'executor', 'vip'];
        const memberRole = role || 'member';
        if (!validRoles.includes(memberRole)) {
          return new Response(
            JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Upsert into org_members
        const { error: upsertError } = await adminClient
          .from('org_members')
          .upsert({
            org_id: effectiveOrgId,
            user_id: targetUser.id,
            role: memberRole,
            created_at: new Date().toISOString(),
          }, { onConflict: 'org_id,user_id' });

        if (upsertError) {
          console.error("Upsert error:", upsertError);
          throw upsertError;
        }

        console.log(`Added user ${email} to org ${effectiveOrgId} with role ${memberRole}`);
        result = { success: true, message: "Member added", userId: targetUser.id, role: memberRole };
        break;

      case "update_member_role":
        // Update a member's role in org_members
        if (!targetUserId || !role) {
          return new Response(
            JSON.stringify({ error: "User ID and role required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const validUpdateRoles = ['owner', 'admin', 'member', 'executor', 'vip'];
        if (!validUpdateRoles.includes(role)) {
          return new Response(
            JSON.stringify({ error: `Invalid role. Must be one of: ${validUpdateRoles.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await adminClient
          .from('org_members')
          .update({ role: role })
          .eq('org_id', effectiveOrgId)
          .eq('user_id', targetUserId);

        if (updateError) throw updateError;
        result = { success: true, message: "Role updated" };
        break;

      case "invite":
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email required for invite" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // First check if user already exists
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          // User exists - add to org_members instead of inviting
          const addRole = role || 'member';
          const { error: addError } = await adminClient
            .from('org_members')
            .upsert({
              org_id: effectiveOrgId,
              user_id: existingUser.id,
              role: addRole,
              created_at: new Date().toISOString(),
            }, { onConflict: 'org_id,user_id' });

          if (addError) throw addError;
          
          result = { 
            success: true, 
            message: "User already exists - added to workspace", 
            userId: existingUser.id,
            alreadyExisted: true 
          };
          break;
        }

        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email);
        
        if (inviteError) {
          console.error("Invite error:", inviteError);
          
          // Handle specific error for existing user
          if (inviteError.code === "email_exists" || inviteError.message?.includes("already been registered")) {
            return new Response(
              JSON.stringify({ error: "A user with this email address already exists" }),
              { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Return all other errors as 500 with the actual message
          return new Response(
            JSON.stringify({ 
              error: inviteError.message || "Failed to send invitation email. Check Supabase Auth email configuration or SMTP settings." 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Add invited user to org_members with default role
        if (inviteData.user?.id) {
          const inviteRole = role || 'member';
          await adminClient
            .from('org_members')
            .upsert({
              org_id: effectiveOrgId,
              user_id: inviteData.user.id,
              role: inviteRole,
              created_at: new Date().toISOString(),
            }, { onConflict: 'org_id,user_id' });
        }
        
        result = { success: true, message: "Invitation sent", userId: inviteData.user?.id };
        break;

      case "get_users":
        // Get all users with their metadata including banned status
        const { data: allAuthUsers, error: listError } = await adminClient.auth.admin.listUsers();
        
        if (listError) throw listError;
        
        result = {
          users: allAuthUsers.users.map((u: any) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            banned_until: u.banned_until || null,
            email_confirmed_at: u.email_confirmed_at,
            last_sign_in_at: u.last_sign_in_at,
          })),
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Admin user management error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
