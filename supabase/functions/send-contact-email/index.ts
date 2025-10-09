import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
  type: "contact" | "suggestion";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, type }: ContactRequest = await req.json();

    const subject = type === "contact" ? "Contact Request" : "Suggestion Submitted";
    
    const emailResponse = await resend.emails.send({
      from: "My Final Wishes <onboarding@resend.dev>",
      to: ["califnena@gmail.com"],
      reply_to: email,
      subject: `${subject} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">${subject}</h1>
          <div style="margin-top: 20px;">
            <p style="color: #666; font-size: 14px;"><strong>From:</strong> ${name}</p>
            <p style="color: #666; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          </div>
          <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h2 style="color: #333; font-size: 16px;">Message:</h2>
            <p style="color: #666; font-size: 14px; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Sent from My Final Wishes Platform
          </p>
        </div>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "My Final Wishes <onboarding@resend.dev>",
      to: [email],
      subject: `We received your ${type === "contact" ? "message" : "suggestion"}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for reaching out!</h1>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Hi ${name},
          </p>
          <p style="color: #666; font-size: 14px;">
            We have received your ${type === "contact" ? "message" : "suggestion"} and will get back to you as soon as possible.
          </p>
          <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h2 style="color: #333; font-size: 16px;">Your message:</h2>
            <p style="color: #666; font-size: 14px; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            <strong>Everlasting Funeral Advisors Team</strong>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <a href="https://everlastingfuneraladvisors.com" style="color: #4F46E5;">everlastingfuneraladvisors.com</a><br/>
            (323) 863-5804
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
