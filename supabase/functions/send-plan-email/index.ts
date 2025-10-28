import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const emailPlanSchema = z.object({
  toEmail: z.string().email("Invalid email format").max(255, "Email too long"),
  pdfData: z.string().max(10 * 1024 * 1024, "PDF data exceeds 10MB limit"), // 10MB limit
  preparedBy: z.string().trim().max(200, "Prepared by field too long"),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validationResult = emailPlanSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { toEmail, pdfData, preparedBy } = validationResult.data;
    
    // Sanitize preparedBy to prevent any potential XSS in email
    const sanitizedPreparedBy = preparedBy.replace(/[<>]/g, ''); // Remove angle brackets

    const emailResponse = await resend.emails.send({
      from: "My Final Wishes <onboarding@resend.dev>",
      to: [toEmail],
      subject: "Your Final Wishes Plan",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">My Final Wishes Plan</h1>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This plan was prepared by <strong>${sanitizedPreparedBy}</strong> and contains important end-of-life planning information.
          </p>
          <p style="color: #666; font-size: 14px;">
            Please find your complete plan attached as a PDF document. Keep this in a safe place and ensure it's accessible to those who will need it.
          </p>
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h2 style="color: #333; font-size: 16px;">What's Included</h2>
            <p style="color: #666; font-size: 14px;">
              This comprehensive plan includes instructions, personal information, contacts, funeral wishes, 
              financial details, and important messages for loved ones.
            </p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Powered by My Final Wishes<br/>
            <a href="https://everlastingfuneraladvisors.com" style="color: #4F46E5;">everlastingfuneraladvisors.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `My-Final-Wishes-Plan.pdf`,
          content: pdfData,
        },
      ],
    });

    console.log("Plan email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-plan-email function:", error);
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
