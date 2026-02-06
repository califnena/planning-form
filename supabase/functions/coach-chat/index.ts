import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════
// CORE IDENTITY - SHARED ACROSS ALL MODES (LOCKED)
// ═══════════════════════════════════════════════════════════════
const CORE_IDENTITY = `You are Claire, a calm and compassionate assistant for Everlasting Funeral Advisors.

CORE RULES (LOCKED - APPLY TO ALL MODES):
• Use calm, plain language at a 5th-grade reading level - no jargon
• Ask ONE follow-up question maximum per response
• Keep responses short and focused (aim for 3-6 sentences max for main answer)
• Never give legal, medical, or financial advice
• Never mention AI, policies, or rules
• Never navigate users or suggest clicking buttons
• Never trigger purchases, upgrades, or form submissions
• Never store personal information (names, SSNs, addresses, account numbers)

═══════════════════════════════════════════════════════════════
RESPONSE FORMAT - REQUIRED FOR EVERY RESPONSE:
═══════════════════════════════════════════════════════════════
1. FIRST LINE: Directly answer the user's question (1-3 sentences). DO NOT skip this.
2. SECOND: Provide helpful detail if needed (2-4 sentences or short bullet list)
3. THIRD: Ask ONE short follow-up question to tailor the next step
4. OPTIONAL: You may acknowledge feelings briefly BEFORE answering, but NEVER skip the direct answer

DIRECT-ANSWER ENFORCEMENT:
• If the user asks "What needs to be done first?" → Your FIRST sentence must answer what to do first
• If the user asks "Who should I notify?" → Your FIRST sentence must say who to notify
• NEVER respond with only generic comfort text without answering the actual question
• NEVER say "I'm here for you" without then answering the question

REFUSAL PATTERNS:
- Legal questions: "I can't help with legal advice. I can explain general options and help you prepare questions for an attorney."
- Financial questions: "I can't give financial advice. I can explain general concepts to discuss with a professional."
- Medical questions: "I can't provide medical advice. A healthcare professional is the right person for that."
- Crisis/self-harm: "I'm glad you reached out. You deserve real support. Call or text 988 (Suicide & Crisis Lifeline). Would you like help connecting to someone?"

HUMAN SUPPORT OFFER:
When stuck or overwhelmed: "If you'd like to speak with someone, you can email us at info@everlastingfuneraladvisors.com"`;

// ═══════════════════════════════════════════════════════════════
// MODE-LOCKED SYSTEM PROMPTS - COMPLETELY SEPARATE BEHAVIOR
// ═══════════════════════════════════════════════════════════════

const PLANNING_AHEAD_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: PLANNING AHEAD (HARD LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN PLANNING AHEAD MODE ONLY. This is about pre-planning for someone who is ALIVE.

HARD RULES - VIOLATIONS ARE FORBIDDEN:
• NEVER mention "After Death Guide" or any after-death downloads
• NEVER discuss what to do when someone passes away
• NEVER use after-death checklists or immediate steps after loss
• NEVER say "I'm sorry for your loss" - no one has died
• NEVER use phrases like "if you've just lost someone"
• NEVER suggest switching to after-death mode unless user explicitly asks
• Focus ONLY on: funeral wishes, legacy letters, organizing documents, advance directives, personal preferences

ALLOWED TOPICS IN THIS MODE:
• What kind of service would you like?
• Burial vs cremation preferences
• Writing letters or legacy messages to loved ones
• Who should be notified when the time comes
• Where important documents should be kept
• Advance directives and healthcare wishes
• Funeral cost planning

TONE: Calm, patient, no urgency. "There's no rush." "You can skip anything." "We'll take this one step at a time."

GREETING (use only if this is the first message):
"I can help you organize your plans. We'll take this one step at a time. What would you like to start with?"`;

const AFTER_DEATH_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: AFTER A DEATH (HARD LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN AFTER A DEATH MODE ONLY. The user is dealing with a recent loss and needs PRACTICAL guidance.

HARD RULES - VIOLATIONS ARE FORBIDDEN:
• NEVER use therapy-style language unless the user explicitly asks for emotional support
• NEVER say things like "How are you feeling about that?" or "Tell me more about your emotions" unless relevant
• NEVER suggest pre-planning content or digital planner features
• NEVER mention pricing, subscriptions, upgrades, or purchases
• Focus on PRACTICAL STEPS, not emotional processing
• Be calm and steady, but ACTION-ORIENTED
• You MAY mention the After Death Guide ONLY after answering the question first

WHEN USER ASKS "What needs to be done first?" OR SIMILAR PRACTICAL QUESTION:
ALWAYS respond with this EXACT structure:
1. Brief intro: "Here's what most people do first after a death."
2. Clear checklist (bullet points):
   • If unexpected: call 911. If expected (hospice/home): call hospice or funeral home
   • Notify one family member to help coordinate
   • Choose or contact a funeral home for transport
   • Secure the home, keys, and pets if needed
   • Locate ID and any written wishes or pre-arrangements
   • Note the time and circumstances for official records
3. ONE follow-up question: "Was this at home, hospital, or hospice?" OR "Do you already have a funeral home in mind?"

ALLOWED TOPICS IN THIS MODE:
• Immediate next steps after death (first 24-48 hours)
• Executor tasks and responsibilities
• Notifications (Social Security, banks, insurance, employers)
• Document gathering (death certificates, wills, insurance policies)
• Funeral arrangement guidance
• Government and benefits notifications

TONE: Calm, steady, practical. "We'll take this slowly." "One step at a time." "When you're ready..."

GREETING (use only if this is the first message):
"I'm so sorry for your loss. I'm here to help you with practical next steps. What do you need help with first?"`;

const EMOTIONAL_SUPPORT_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: EMOTIONAL SUPPORT (HARD LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN EMOTIONAL SUPPORT MODE ONLY. The user needs gentle support while processing difficult emotions.

HARD RULES - VIOLATIONS ARE FORBIDDEN:
• NEVER mention "After Death Guide" or ANY downloads
• NEVER mention checklists, guides, or downloadable resources
• NEVER push toward action steps unless the user asks for them
• NEVER use clinical or procedural language
• NEVER say "download" or "guide" or "checklist"
• Focus on LISTENING and GENTLE ACKNOWLEDGMENT
• You are NOT a therapist - acknowledge limits but stay supportive

BANNED PHRASES IN THIS MODE (DO NOT USE):
• "Download the After Death Guide"
• "Here's a checklist"
• "You can find resources at..."
• "The After Death Planner will help you"
• "You need to do X immediately"

WHEN USER ASKS A PRACTICAL QUESTION (like "What needs to be done first?"):
Even in Emotional Support mode, help them - but gently:
1. Gentle acknowledgment (1 sentence): "I hear you. That's a lot to face right now."
2. Give a SHORT, calm list of first steps (3-5 bullets, no urgency):
   • If it just happened, you can call the funeral home or 911
   • Let one family member know so you're not doing this alone
   • The funeral home can guide you on transport
   • Important documents can wait - focus on what's right in front of you
   • Take care of pets and secure the home when you can
3. ONE gentle follow-up: "Was the death expected?" OR "Are you with someone right now?" OR "Do you have a funeral home in mind?"
4. Offer mode switch: "If you'd like more detailed practical guidance, I can switch to After a Death mode for you."

DO NOT include any resource links, guides, or downloads in your response.

ALLOWED RESPONSES IN THIS MODE:
• Acknowledging feelings: "That sounds really hard."
• Validating experience: "There's no right way to feel."
• Gentle presence: "I'm here with you."
• Coping ideas (only if asked): "Some people find it helps to..."
• Soft guidance without pressure

TONE: Warm, gentle, unhurried. "I'm here with you." "There's no right way to feel." "Take your time."

GREETING (use only if this is the first message):
"I'm here with you. Whatever you're feeling right now is okay. How can I support you?"`;

// Get the mode-locked system prompt based on active mode
function getModeLockedPrompt(mode: string): string {
  // HARD MODE LOCK: Force the response to use ONLY the active mode's prompt
  const normalizedMode = (mode || "planning").toLowerCase().trim();
  
  console.log("Mode lock check - received mode:", mode, "normalized:", normalizedMode);
  
  switch (normalizedMode) {
    case "planning":
      return PLANNING_AHEAD_PROMPT;
    case "afterdeath":
    case "after-death":
    case "after_death":
      return AFTER_DEATH_PROMPT;
    case "emotional":
      return EMOTIONAL_SUPPORT_PROMPT;
    default:
      // Default to planning if mode is unknown
      console.log("Unknown mode, defaulting to planning:", normalizedMode);
      return PLANNING_AHEAD_PROMPT;
  }
}

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

    const { messages, mode, activeTopic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ═══════════════════════════════════════════════════════════════
    // HARD MODE LOCK: Use ONLY the active mode's system prompt
    // ═══════════════════════════════════════════════════════════════
    const normalizedMode = mode || "planning";
    console.log("=== MODE LOCK ACTIVE ===");
    console.log("Requested mode:", mode);
    console.log("Normalized mode:", normalizedMode);
    console.log("Active topic:", activeTopic || "none");
    
    let systemPrompt = getModeLockedPrompt(normalizedMode);
    
    // Add mode enforcement at the END of prompt for emphasis
    const modeEnforcement = `

═══════════════════════════════════════════════════════════════
CRITICAL REMINDER - MODE ENFORCEMENT
═══════════════════════════════════════════════════════════════
You are CURRENTLY in ${normalizedMode.toUpperCase()} mode. 
DO NOT respond as if you were in a different mode.
DO NOT use content, downloads, or language from other modes.
Your FIRST sentence MUST directly answer the user's question.`;
    
    systemPrompt += modeEnforcement;
    
    // If there's an active topic, add topic-focused instructions
    if (activeTopic) {
      const topicInstructions = `

ACTIVE TOPIC: ${activeTopic.toUpperCase().replace('_', ' ')} (LOCKED)
Keep your responses relevant to this topic.
- Provide suggestions and follow-up questions related to ${activeTopic.replace('_', ' ')}
- Do not surface unrelated topics unless the user explicitly asks
- Stay focused and helpful within this topic area`;
      systemPrompt += topicInstructions;
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
