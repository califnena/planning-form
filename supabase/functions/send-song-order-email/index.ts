import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SongOrderRequest {
  orderId: string;
  packageType: string;
  requestData: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, packageType, requestData }: SongOrderRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user info
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    const emailHtml = `
      <h1>New Custom Tribute Song Order</h1>
      <h2>Order Details</h2>
      <p><strong>Package:</strong> ${packageType.toUpperCase()}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer Email:</strong> ${user?.email || 'N/A'}</p>
      
      <h2>Song Request Details</h2>
      <p><strong>Person's Name:</strong> ${requestData.personName}</p>
      <p><strong>Delivery Email:</strong> ${requestData.deliveryEmail}</p>
      <p><strong>Phone:</strong> ${requestData.phone}</p>
      <p><strong>Genre:</strong> ${requestData.genre}</p>
      <p><strong>Mood:</strong> ${requestData.mood}</p>
      <p><strong>Language:</strong> ${requestData.language}</p>
      <p><strong>Vocal Style:</strong> ${requestData.vocalStyle}</p>
      <p><strong>Length:</strong> ${requestData.length}</p>
      
      <h3>Life Story</h3>
      <p>${requestData.lifeStory || 'Not provided'}</p>
      
      <h3>Relationships</h3>
      <p>${requestData.relationships || 'Not provided'}</p>
      
      <h3>Special Memories</h3>
      <p>${requestData.specialMemories || 'Not provided'}</p>
      
      <h3>Additional Notes</h3>
      <p>${requestData.additionalNotes || 'Not provided'}</p>
    `;

    // Use Resend HTTP API directly
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Everlasting Orders <orders@resend.dev>",
        to: ["efa.denisse@gmail.com", "efa.rickayon@gmail.com"],
        subject: "New Tribute Song Order",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Song order email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-song-order-email function:", error);
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
