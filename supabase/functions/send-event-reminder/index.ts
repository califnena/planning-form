import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AudienceFilter {
  state: string;
  counties: string[];
  categories: string[];
  activeOnly: boolean;
}

interface SendReminderRequest {
  logId: string;
  eventId: string;
  subject: string;
  preview: string;
  body: string;
  audienceFilter: AudienceFilter;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication header exists
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create a client bound to the user's JWT to validate identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    // Validate the user's identity
    const { data: userData, error: userError } = await userClient.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      console.error("Invalid user token:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`User ${user.id} attempting to send event reminder`);

    // Check if user has admin role using the has_app_role function
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: isAdmin, error: roleError } = await serviceClient.rpc('has_app_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return new Response(JSON.stringify({ error: "Authorization check failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isAdmin) {
      console.error(`User ${user.id} is not an admin - access denied`);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Admin access verified for user ${user.id}`);

    const { logId, eventId, subject, preview, body, audienceFilter }: SendReminderRequest = await req.json();

    console.log(`Processing send reminder for event ${eventId}, log ${logId}`);

    // Fetch subscribers based on audience filter using service client
    let query = serviceClient
      .from("efa_event_subscribers")
      .select("id, email, first_name, unsub_token");

    if (audienceFilter.activeOnly) {
      query = query.eq("is_active", true);
    }

    if (audienceFilter.state && audienceFilter.state !== "ALL") {
      query = query.contains("state_interest", [audienceFilter.state]);
    }

    const { data: subscribers, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found for the given filters");
      
      // Update log with 0 sent
      await serviceClient
        .from("efa_event_email_log")
        .update({ 
          status: "sent", 
          sent_to_count: 0,
          sent_at: new Date().toISOString() 
        })
        .eq("id", logId);

      return new Response(JSON.stringify({ success: true, sentCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${subscribers.length} subscribers to send to`);

    // Build unsubscribe URL base
    const appUrl = supabaseUrl.replace(".supabase.co", ".lovable.app") || "";
    
    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        const unsubscribeUrl = `${appUrl}/unsubscribe?token=${subscriber.unsub_token}`;
        const personalizedBody = body
          .replace(/\{\{first_name\}\}/g, subscriber.first_name || "Friend");
        
        const htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${personalizedBody.split("\n").map(p => `<p>${p}</p>`).join("")}
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #666;">
              We do not control third-party event details.
            </p>
            <p style="font-size: 12px; color: #666;">
              <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> from event reminders.
            </p>
            <p style="font-size: 12px; color: #666;">
              Everlasting Funeral Advisors
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: "Everlasting Funeral Advisors <events@resend.dev>",
            to: [subscriber.email],
            subject: subject,
            html: htmlBody,
          });
          sentCount++;
        } catch (emailError: any) {
          console.error(`Failed to send to ${subscriber.email}:`, emailError);
          errors.push(`${subscriber.email}: ${emailError.message}`);
        }
      });

      await Promise.all(emailPromises);
      
      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Sent ${sentCount}/${subscribers.length} emails`);

    // Update log with results
    await serviceClient
      .from("efa_event_email_log")
      .update({ 
        status: errors.length > 0 && sentCount === 0 ? "failed" : "sent", 
        sent_to_count: sentCount,
        sent_at: new Date().toISOString() 
      })
      .eq("id", logId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount, 
        totalSubscribers: subscribers.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
