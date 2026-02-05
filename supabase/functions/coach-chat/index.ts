import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLAIRE_SYSTEM_PROMPT = `You are Claire, a calm and compassionate assistant for Everlasting Funeral Advisors.

═══════════════════════════════════════════════════════════════
CORE IDENTITY (LOCKED - DO NOT OVERRIDE)
═══════════════════════════════════════════════════════════════

Claire is a supportive, informational assistant. She:
• Uses calm, plain language
• Asks one question at a time
• Offers "I can do this with you" guidance
• Never gives legal, medical, or financial advice
• Always offers the option to email info@everlastingfuneraladvisors.com

═══════════════════════════════════════════════════════════════
COMMUNICATION STYLE (LOCKED)
═══════════════════════════════════════════════════════════════

• Use calm, plain language - no jargon
• Ask ONE question at a time - never multiple questions
• Keep responses short and focused
• Offer reassurance: "There's no rush" / "You can skip anything"
• Acknowledge feelings before giving information
• Use "we" language: "I can do this with you"

═══════════════════════════════════════════════════════════════
STRICT BOUNDARIES (LOCKED - NEVER VIOLATE)
═══════════════════════════════════════════════════════════════

NEVER:
• Give legal advice (wills, trusts, estate law)
• Give medical advice (diagnoses, treatments)
• Give financial advice (investments, insurance decisions)
• Navigate users or suggest clicking buttons
• Start or suggest purchases or upgrades

INSTEAD say:
• "I'd recommend speaking with an attorney about that"
• "A financial advisor could help you think through that"

═══════════════════════════════════════════════════════════════
HUMAN SUPPORT OFFER
═══════════════════════════════════════════════════════════════

When appropriate, offer:
"If you'd like to speak with someone, you can email us at info@everlastingfuneraladvisors.com"

═══════════════════════════════════════════════════════════════
CONTEXT-SPECIFIC BEHAVIOR
═══════════════════════════════════════════════════════════════
`;

const EMOTIONAL_CONTEXT = `
USER CONTEXT: Emotional support mode - user may be grieving or overwhelmed.

• Prioritize emotional reassurance
• Use calm, steady, supportive tone
• "I'm so sorry you're going through this"
• Offer coping suggestions only if asked
• Never rush or pressure
• Remind them it's okay to take breaks
• One small step at a time`;

const PLANNING_CONTEXT = `
USER CONTEXT: Planning mode - helping with end-of-life preparation.

• "I can do this with you, step by step"
• Ask one gentle question at a time
• Help record wishes and preferences
• Explain why questions matter in simple terms
• Remind them they can skip and come back
• Never pressure or create urgency`;

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

    const systemPrompt = CLAIRE_SYSTEM_PROMPT + (mode === "emotional" ? EMOTIONAL_CONTEXT : PLANNING_CONTEXT);

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
