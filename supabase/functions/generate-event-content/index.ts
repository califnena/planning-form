import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventData {
  name: string;
  category: string;
  event_date_start: string;
  event_date_end?: string;
  time_text?: string;
  venue?: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  description?: string;
  cost_attendee?: string;
  is_vendor_friendly: boolean;
  booth_fee?: string;
  booth_deadline?: string;
  exhibitor_link?: string;
  event_link?: string;
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
}

const LIST_SUMMARY_SYSTEM = `You write short, factual summaries for event list cards. Use only provided fields. No marketing language.`;

const LIST_SUMMARY_USER = (event: EventData) => `Create 1 sentence, max 140 characters.
Include who it's for and what it helps with.
No emojis. No sales language.
Event fields:
Name: ${event.name}
Category: ${event.category}
Date: ${event.event_date_start}
City/State: ${event.city || "TBD"}, ${event.state || ""}
Cost: ${event.cost_attendee || "See event details"}
Vendor-friendly: ${event.is_vendor_friendly}`;

const DETAIL_SYSTEM = `You write calm, supportive, educational event descriptions for families and caregivers. Never invent details.`;

const DETAIL_USER = (event: EventData) => `Write a full event description using this structure:
* 2–3 sentence overview
* "What you can expect" bullets (3–6)
* Reassurance sentence
* Footer: "This event is listed for educational and informational purposes."
If category = Grief Support: add one privacy/safety sentence.
If vendor-friendly = true: add "Vendor Information" bullets and note organizer controls fees/deadlines.
Use only these fields:
Name: ${event.name}
Category: ${event.category}
Date start: ${event.event_date_start}
Date end: ${event.event_date_end || "N/A"}
Time: ${event.time_text || "See event details"}
Venue: ${event.venue || "See event details"}
Address: ${event.address || ""}
City/State/Zip: ${event.city || ""}, ${event.state || ""} ${event.zip || ""}
Cost: ${event.cost_attendee || "See event details"}
Booth fee: ${event.booth_fee || "N/A"}
Exhibitor link: ${event.exhibitor_link || "N/A"}
Event link: ${event.event_link || "N/A"}
Organizer: ${event.organizer_name || ""} / ${event.organizer_email || ""} / ${event.organizer_phone || ""}`;

const EMAIL_SYSTEM = `You write short, factual email reminders. Calm tone. No hype. Use only provided fields.`;

const EMAIL_USER = (event: EventData) => `Output in this exact format:
SUBJECT: [max 60 chars]
PREVIEW: [max 90 chars]
BODY:
[150–220 words including date/time, location, cost, who it's for, and event link]
[Add: "We do not control third-party event details."]
${event.is_vendor_friendly ? `[Add a short "For vendors" section with booth fee and exhibitor link, and note organizer controls availability.]` : ""}

Use only these fields:
Name: ${event.name}
Category: ${event.category}
Date start/end: ${event.event_date_start} / ${event.event_date_end || "N/A"}
Time: ${event.time_text || "See event details"}
Venue: ${event.venue || "See event details"}
Address: ${event.address || ""}, ${event.city || ""}, ${event.state || ""} ${event.zip || ""}
Cost: ${event.cost_attendee || "See event details"}
Booth fee: ${event.booth_fee || "N/A"}
Exhibitor link: ${event.exhibitor_link || "N/A"}
Event link: ${event.event_link || "See event organizer"}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, event } = await req.json() as { type: "list" | "detail" | "email"; event: EventData };

    if (!event?.name || !event?.category || !event?.event_date_start) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, category, event_date_start" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let userPrompt: string;

    switch (type) {
      case "list":
        systemPrompt = LIST_SUMMARY_SYSTEM;
        userPrompt = LIST_SUMMARY_USER(event);
        break;
      case "detail":
        systemPrompt = DETAIL_SYSTEM;
        userPrompt = DETAIL_USER(event);
        break;
      case "email":
        systemPrompt = EMAIL_SYSTEM;
        userPrompt = EMAIL_USER(event);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid type. Use: list, detail, or email" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse email response into structured fields
    if (type === "email") {
      const subjectMatch = content.match(/SUBJECT:\s*(.+)/i);
      const previewMatch = content.match(/PREVIEW:\s*(.+)/i);
      const bodyMatch = content.match(/BODY:\s*([\s\S]+)/i);

      return new Response(
        JSON.stringify({
          email_subject: subjectMatch?.[1]?.trim() || "",
          email_preview: previewMatch?.[1]?.trim() || "",
          email_body: bodyMatch?.[1]?.trim() || content,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
