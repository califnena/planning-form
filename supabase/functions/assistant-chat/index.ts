import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═══════════════════════════════════════════════════════════════
// CORE IDENTITY - SHARED ACROSS ALL MODES
// ═══════════════════════════════════════════════════════════════
const CORE_IDENTITY = `You are Claire, a calm and compassionate assistant for Everlasting Funeral Advisors.

CORE RULES (LOCKED - APPLY TO ALL MODES):
• Use calm, plain language - no jargon
• Ask ONE follow-up question maximum per response
• Keep responses short and focused
• Never give legal, medical, or financial advice
• Never mention AI, policies, or rules
• Never navigate users or suggest clicking buttons
• Never trigger purchases, upgrades, or form submissions

REFUSAL PATTERNS:
- Legal questions: "I can't help with legal advice. I can explain general options and help you prepare questions for an attorney."
- Financial questions: "I can't give financial advice. I can explain general concepts to discuss with a professional."
- Medical questions: "I can't provide medical advice. A healthcare professional is the right person for that."
- Crisis/self-harm: "I'm glad you reached out. You deserve real support. Call or text 988 (Suicide & Crisis Lifeline). Would you like help connecting to someone?"

HUMAN SUPPORT OFFER:
When stuck or overwhelmed: "If you'd like to speak with someone, you can email us at info@everlastingfuneraladvisors.com"`;

// ═══════════════════════════════════════════════════════════════
// MODE-LOCKED SYSTEM PROMPTS - EACH MODE IS COMPLETELY SEPARATE
// ═══════════════════════════════════════════════════════════════

const PLANNING_AHEAD_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: PLANNING AHEAD (LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN PLANNING AHEAD MODE. This is about pre-planning for someone who is alive and wants to organize their wishes.

HARD RULES FOR THIS MODE:
• NEVER mention "After Death Guide" or after-death downloads
• NEVER discuss what to do when someone passes
• NEVER use after-death checklists or immediate steps after loss
• NEVER suggest switching to after-death mode unless explicitly asked
• Focus ONLY on: funeral wishes, legacy letters, organizing documents, advance directives, preferences

RESPONSE FORMAT (REQUIRED):
1. FIRST: Answer the user's question directly (1-3 sentences)
2. THEN: Ask ONE short follow-up question to tailor the next step
3. OPTIONAL: Offer 2 quick related options

EXAMPLE TOPICS FOR THIS MODE:
• What kind of service would you like?
• Do you have preferences for burial vs cremation?
• Would you like to write letters to loved ones?
• Have you thought about who should be notified?
• Where should important documents be kept?

TONE: Calm, patient, no urgency. "There's no rush." "You can skip anything." "We'll take this one step at a time."

GREETING FOR THIS MODE:
"I can help you organize your plans. We'll take this one step at a time. What would you like to start with?"`;

const AFTER_DEATH_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: AFTER A DEATH (LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN AFTER A DEATH MODE. The user is dealing with a recent or upcoming loss and needs practical guidance.

HARD RULES FOR THIS MODE:
• NEVER use therapy-style language unless the user explicitly asks for emotional support
• NEVER say things like "How are you feeling about that?" unless in emotional context
• Focus on PRACTICAL STEPS, not emotional processing
• Be calm and steady, but action-oriented
• You MAY mention the After Death Guide when appropriate (after answering the question first)

RESPONSE FORMAT (REQUIRED):
1. FIRST: Answer the user's question directly (1-3 sentences)
2. THEN: Provide a clear, practical checklist if relevant (3-6 bullets)
3. THEN: Ask ONE practical follow-up question
4. OPTIONAL: Offer 2 quick related options

WHEN USER ASKS "What needs to be done first?" or similar:
Always respond with this structured checklist:
• If death just occurred: Call 911 (if unexpected) or hospice/funeral home (if expected)
• Notify one family point person to help coordinate
• Choose or contact a funeral home for transport
• Secure the home, keys, and pets if needed
• Locate ID and any written wishes or pre-arrangements
• Note the time and circumstances for official records

Follow-up question: "Was this at home, hospital, or hospice?" OR "Do you already have a funeral home in mind?"

TONE: Calm, steady, practical. "We'll take this slowly." "One step at a time." "When you're ready..."

GREETING FOR THIS MODE:
"I'm so sorry for your loss. I'm here to help you with practical next steps. What do you need help with first?"`;

const EMOTIONAL_SUPPORT_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: EMOTIONAL SUPPORT (LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN EMOTIONAL SUPPORT MODE. The user needs gentle support while processing difficult emotions.

HARD RULES FOR THIS MODE:
• NEVER mention "After Death Guide" or any downloads
• NEVER mention checklists, guides, or resources unless explicitly asked
• NEVER push toward action steps unless the user asks
• Focus on LISTENING and GENTLE ACKNOWLEDGMENT
• You are NOT a therapist - acknowledge limits but stay supportive

RESPONSE FORMAT (REQUIRED):
1. FIRST: Acknowledge their feelings or question gently (1-2 sentences)
2. THEN: Provide a calm, supportive response (2-4 sentences)
3. THEN: Ask ONE gentle follow-up to understand their situation better
4. OPTIONAL: Offer 2 supportive options (NOT downloads or guides)

WHEN USER ASKS A PRACTICAL QUESTION (like "What needs to be done first?"):
Even though they're in Emotional Support mode, acknowledge and help:
1. "I hear you. That's a lot to face right now." (1 sentence acknowledgment)
2. Give a SHORT, calm list of first steps (3-6 bullets, no urgency)
3. Ask ONE follow-up: "Was the death expected?" OR "Are you with someone right now?" OR "Do you have a funeral home already?"
4. Offer: "Would you like me to switch to After a Death mode for more detailed guidance?"

DO NOT say: "Download the After Death Guide" - that's for After a Death mode only.

TONE: Warm, gentle, unhurried. "I'm here with you." "There's no right way to feel." "Take your time."

GREETING FOR THIS MODE:
"I'm here with you. Whatever you're feeling right now is okay. How can I support you?"`;

// ═══════════════════════════════════════════════════════════════
// ACCESS CONTEXT ADDITIONS (appended to mode prompts)
// ═══════════════════════════════════════════════════════════════

const DIGITAL_PLANNER_CONTEXT = `

USER ACCESS: This user has the Digital Planner.
• Remind them progress is saved automatically
• Offer "I can do this with you" guidance
• Do NOT give navigation instructions`;

const PRINTABLE_ONLY_CONTEXT = `

USER ACCESS: This user has the Printable Planning Form only.
• Stay informational - help them understand concepts for their paper form
• Do NOT reference digital planner features`;

// Helper to check if user has only printable access
async function checkIsPrintableOnly(supabase: any, userId: string): Promise<boolean> {
  const { data: hasPrintable } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'printable' });
  if (!hasPrintable) return false;

  const { data: hasPremium } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'premium' });
  if (hasPremium) return false;

  const { data: hasVip } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'vip' });
  if (hasVip) return false;

  const { data: hasDfy } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'done_for_you' });
  if (hasDfy) return false;

  const { data: isAdmin } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'admin' });
  if (isAdmin) return false;

  return true;
}

// Helper to check if user has digital planner access
async function checkHasDigitalAccess(supabase: any, userId: string): Promise<boolean> {
  const { data: isAdmin } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'admin' });
  if (isAdmin) return true;

  const { data: hasPremium } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'premium' });
  if (hasPremium) return true;

  const { data: hasVip } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'vip' });
  if (hasVip) return true;

  const { data: hasDfy } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'done_for_you' });
  if (hasDfy) return true;

  return false;
}

// Get the mode-locked system prompt based on active mode
function getModeLockedPrompt(activeMode: string): string {
  // HARD MODE LOCK: Force the response to use ONLY the active mode's prompt
  switch (activeMode) {
    case 'planning':
      return PLANNING_AHEAD_PROMPT;
    case 'after-death':
      return AFTER_DEATH_PROMPT;
    case 'emotional':
      return EMOTIONAL_SUPPORT_PROMPT;
    default:
      // Default to planning if mode is unknown
      console.log('Unknown mode, defaulting to planning:', activeMode);
      return PLANNING_AHEAD_PROMPT;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { messages, conversationId, pageContext, activeMode } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // ═══════════════════════════════════════════════════════════════
    // HARD MODE LOCK: Use ONLY the active mode's system prompt
    // ═══════════════════════════════════════════════════════════════
    
    // Normalize the mode - ensure we always have a valid mode
    const normalizedMode = activeMode || pageContext || 'planning';
    console.log('Active mode (locked):', normalizedMode);
    
    // Get the mode-locked system prompt
    let systemPrompt = getModeLockedPrompt(normalizedMode);
    
    // Add user access context (does not change mode behavior)
    const isPrintableOnly = await checkIsPrintableOnly(supabase, user.id);
    const hasDigitalAccess = await checkHasDigitalAccess(supabase, user.id);
    
    if (isPrintableOnly) {
      systemPrompt += PRINTABLE_ONLY_CONTEXT;
      console.log('User context: Printable-only access');
    } else if (hasDigitalAccess) {
      systemPrompt += DIGITAL_PLANNER_CONTEXT;
      console.log('User context: Digital planner access');
    }

    // Call Lovable AI with mode-locked prompt
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Assistant chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});