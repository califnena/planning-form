import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
const appUrl = Deno.env.get("APP_PUBLIC_URL") ?? "https://everlastingfuneraladvisors.com";

const resend = new Resend(resendKey);

const ALLOWED_ORIGINS = new Set([
  "https://everlastingfuneraladvisors.com",
  "https://www.everlastingfuneraladvisors.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Only set allow-origin for known origins - reject unknown
  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

interface AudienceFilter {
  state: string;
  counties: string[];
  categories: string[];
  activeOnly: boolean;
}

interface SendReminderRequest {
  orgId: string;
  logId: string;
  eventId: string;
  subject: string;
  preview?: string;
  body: string;
  audienceFilter: AudienceFilter;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("send-event-reminder: Starting request");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("send-event-reminder: Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!resendKey) {
      console.error("send-event-reminder: Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.warn("send-event-reminder: No Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      console.warn("send-event-reminder: Invalid JWT", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("send-event-reminder: User authenticated:", user.id);

    const payload: SendReminderRequest = await req.json();
    const { orgId, logId, eventId, subject, body, audienceFilter } = payload;

    console.log("send-event-reminder: Payload:", { orgId, logId, eventId, audienceFilter });

    if (!orgId || !logId || !eventId || !subject || !body || !audienceFilter) {
      console.warn("send-event-reminder: Missing required fields");
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Permission check: must be org owner/admin (uses RLS)
    const { data: membership, error: memErr } = await userClient
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) {
      console.error("send-event-reminder: Membership check failed:", memErr.message);
      return new Response(JSON.stringify({ error: "Authorization check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      console.warn("send-event-reminder: User not authorized for org", { userId: user.id, orgId, role: membership?.role });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("send-event-reminder: User authorized as", membership.role);

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // FIX #1: Strong event validation - event MUST exist AND org_id MUST match
    const { data: eventRow, error: eventErr } = await serviceClient
      .from("efa_events")
      .select("id, org_id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventErr) {
      console.error("send-event-reminder: Event lookup failed:", eventErr.message);
      return new Response(JSON.stringify({ error: "Event lookup failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Event must exist AND have org_id AND org_id must match requested org
    if (!eventRow || !eventRow.org_id || eventRow.org_id !== orgId) {
      console.warn("send-event-reminder: Event not found or org mismatch", { 
        eventId, 
        orgId, 
        eventExists: !!eventRow,
        eventOrgId: eventRow?.org_id 
      });
      return new Response(JSON.stringify({ error: "Event not found for this organization" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // FIX #3: Validate log belongs to org before doing anything
    const { data: logRow, error: logErr } = await serviceClient
      .from("efa_event_email_log")
      .select("id, org_id")
      .eq("id", logId)
      .maybeSingle();

    if (logErr) {
      console.error("send-event-reminder: Log lookup failed:", logErr.message);
      return new Response(JSON.stringify({ error: "Log lookup failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!logRow || logRow.org_id !== orgId) {
      console.warn("send-event-reminder: Log not found or org mismatch", { logId, orgId, logOrgId: logRow?.org_id });
      return new Response(JSON.stringify({ error: "Log not found for this organization" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // FIX #2: Fetch subscribers scoped to org with ALL filters applied
    let query = serviceClient
      .from("efa_event_subscribers")
      .select("id, email, first_name, unsub_token")
      .eq("org_id", orgId);

    if (audienceFilter.activeOnly) {
      query = query.eq("is_active", true);
    }
    if (audienceFilter.state && audienceFilter.state !== "ALL") {
      query = query.contains("state_interest", [audienceFilter.state]);
    }
    // Apply county filter
    if (audienceFilter.counties && audienceFilter.counties.length > 0) {
      query = query.overlaps("county_interest", audienceFilter.counties);
    }
    // Apply category filter  
    if (audienceFilter.categories && audienceFilter.categories.length > 0) {
      query = query.overlaps("category_interest", audienceFilter.categories);
    }

    const { data: subscribers, error: fetchError } = await query;
    if (fetchError) {
      console.error("send-event-reminder: Failed to fetch subscribers:", fetchError.message);
      return new Response(JSON.stringify({ error: "Failed to fetch subscribers" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("send-event-reminder: Found subscribers:", subscribers?.length ?? 0);

    if (!subscribers || subscribers.length === 0) {
      // FIX #3: Update log with org scope
      await serviceClient
        .from("efa_event_email_log")
        .update({
          status: "sent",
          sent_to_count: 0,
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId)
        .eq("org_id", orgId);

      return new Response(JSON.stringify({ success: true, sentCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (subscriber) => {
          const unsubscribeUrl = `${appUrl}/unsubscribe?token=${subscriber.unsub_token}`;
          const personalizedBody = body.replace(/\{\{first_name\}\}/g, subscriber.first_name || "Friend");

          const htmlBody = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${personalizedBody.split("\n").map((p) => `<p style="margin: 10px 0;">${p}</p>`).join("")}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666;">We do not control third-party event details.</p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe from event reminders.</a>
              </p>
              <p style="font-size: 11px; color: #999; margin-top: 20px;">Everlasting Funeral Advisors</p>
            </body>
            </html>
          `;

          try {
            await resend.emails.send({
              from: "Everlasting Funeral Advisors <events@everlastingfuneraladvisors.com>",
              to: [subscriber.email],
              subject,
              html: htmlBody,
            });
            sentCount++;
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "send failed";
            errors.push(`${subscriber.email}: ${errorMessage}`);
            console.error(`send-event-reminder: Failed to send to ${subscriber.email}:`, errorMessage);
          }
        }),
      );

      if (i + batchSize < subscribers.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    console.log(`send-event-reminder: Complete. Sent: ${sentCount}, Errors: ${errors.length}`);

    // FIX #3: Update log with org scope
    await serviceClient
      .from("efa_event_email_log")
      .update({
        status: errors.length > 0 && sentCount === 0 ? "failed" : "sent",
        sent_to_count: sentCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", logId)
      .eq("org_id", orgId);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        totalSubscribers: subscribers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("send-event-reminder: Unhandled error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
