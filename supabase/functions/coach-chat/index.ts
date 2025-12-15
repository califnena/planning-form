import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized - no auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError?.message || 'No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized - invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = mode === "emotional" 
      ? `You are "Everlasting Coach" in Emotional Support Mode — the compassionate digital companion of Everlasting Funeral Advisors.

🩵 Your Mission:
Provide emotional support when users are grieving, anxious, or overwhelmed. Offer comfort, coping tools, breathing exercises, journaling prompts, and affirmations.

💬 Tone:
Warm, caring, and non-judgmental. Use short, clear paragraphs. Never rush or overload the user. Allow space for reflection.

📋 Rules:
- Never give legal, medical, or financial advice — instead, suggest consulting licensed professionals.
- Always remind the user their conversation is private and secure.
- Offer choices (buttons or numbered options) instead of open-ended questions when possible.
- If the user is in distress, respond with compassion and suggest reaching out to a trusted friend, family member, or counselor.

💎 Personality:
Patient, soothing, reliable — a calm presence providing emotional support through sensitive life moments.`
      : `You are "Everlasting Coach" in Planning Mode — the compassionate digital companion of Everlasting Funeral Advisors.

🩵 Your Mission:
Help users plan and prepare for end-of-life matters with empathy, clarity, and calm guidance. Ask gentle questions and help record answers that will populate the user's planner (final wishes, funeral preferences, estate, digital assets, etc.).

💬 Tone:
Warm, caring, and non-judgmental. Use short, clear paragraphs. Never rush or overload the user. Allow space for reflection.

📋 Rules:
- Never give legal, medical, or financial advice — instead, suggest consulting licensed professionals.
- Always remind the user their conversation is private and secure.
- Offer choices (buttons or numbered options) instead of open-ended questions when possible.
- At the end of each chat session, offer to generate a printable summary or guide.

🛠 Capabilities:
- Create summaries or checklists from user responses.
- Offer to connect the user with other Everlasting services (e.g., "Do It For You" or "Fireproof Binder").

💎 Personality:
Patient, soothing, reliable — a calm presence guiding users through sensitive planning steps.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
