import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";

const resend = new Resend(resendKey);

const ALLOWED_ORIGINS = new Set([
  "https://everlastingfuneraladvisors.com",
  "https://www.everlastingfuneraladvisors.com",
]);

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://everlastingfuneraladvisors.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
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
  preview: string;
  body: string;
  audienceFilter: AudienceFilter;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!resendKey) {
      console.error("Missing Resend API key");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
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
      console.log("User authentication failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Authenticated user:", user.id);

    const payload: SendReminderRequest = await req.json();
    const { orgId, logId, eventId, subject, body, audienceFilter } = payload;

    if (!orgId || !logId || !eventId || !subject || !body || !audienceFilter) {
      console.log("Missing required fields in payload");
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Permission check: must be org owner/admin
    const { data: membership, error: memErr } = await userClient
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr) {
      console.error("Membership check failed:", memErr.message);
      return new Response(JSON.stringify({ error: "Authorization check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      console.log("User lacks permission. Role:", membership?.role);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("User authorized with role:", membership.role);

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Fetch subscribers scoped to this org
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

    const { data: subscribers, error: fetchError } = await query;
    if (fetchError) {
      console.error("Failed to fetch subscribers:", fetchError.message);
      throw fetchError;
    }

    console.log("Found subscribers:", subscribers?.length ?? 0);

    if (!subscribers || subscribers.length === 0) {
      await serviceClient
        .from("efa_event_email_log")
        .update({
          status: "sent",
          sent_to_count: 0,
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);

      return new Response(JSON.stringify({ success: true, sentCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const appUrl = "https://everlastingfuneraladvisors.com";
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
              ${personalizedBody.split("\n").map((p) => `<p>${p}</p>`).join("")}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">We do not control third-party event details.</p>
              <p style="font-size: 12px; color: #666;">
                <a href="${unsubscribeUrl}">Unsubscribe from event reminders.</a>
              </p>
              <p style="font-size: 12px; color: #999;">Everlasting Funeral Advisors</p>
            </body>
            </html>
          `;

          try {
            await resend.emails.send({
              from: "Everlasting Funeral Advisors <noreply@resend.dev>",
              to: [subscriber.email],
              subject,
              html: htmlBody,
            });
            sentCount++;
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "send failed";
            errors.push(`${subscriber.email}: ${errorMessage}`);
            console.error(`Failed to send to ${subscriber.email}:`, errorMessage);
          }
        }),
      );

      if (i + batchSize < subscribers.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`Email send complete. Sent: ${sentCount}, Errors: ${errors.length}`);

    await serviceClient
      .from("efa_event_email_log")
      .update({
        status: errors.length > 0 && sentCount === 0 ? "failed" : "sent",
        sent_to_count: sentCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", logId);

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
    console.error("Unhandled error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
