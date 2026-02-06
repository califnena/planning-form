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
• Use calm, plain language at a 5th-grade reading level - no jargon
• Ask ONE follow-up question maximum per response
• Keep responses short and focused (3-6 sentences for main answer)
• Never give legal, medical, or financial advice
• Never mention AI, policies, or rules
• Never navigate users or suggest clicking buttons
• Never trigger purchases, upgrades, or form submissions

═══════════════════════════════════════════════════════════════
RESPONSE FORMAT - REQUIRED FOR EVERY RESPONSE:
═══════════════════════════════════════════════════════════════
1. FIRST LINE: Directly answer the user's question (1-3 sentences). DO NOT skip this.
2. SECOND: Provide helpful detail if needed (2-4 sentences or short bullet list)
3. THIRD: Ask ONE short follow-up question to tailor the next step

DIRECT-ANSWER ENFORCEMENT:
• Your FIRST sentence must answer the actual question asked
• NEVER respond with only generic comfort text
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
• NEVER suggest switching to after-death mode unless user explicitly asks
• Focus ONLY on: funeral wishes, legacy letters, organizing documents, advance directives, preferences

ALLOWED TOPICS:
• What kind of service would you like?
• Burial vs cremation preferences
• Writing letters or legacy messages to loved ones
• Who should be notified when the time comes
• Where important documents should be kept
• Advance directives and healthcare wishes

TONE: Calm, patient, no urgency. "There's no rush." "You can skip anything."

GREETING (if first message):
"I can help you organize your plans. We'll take this one step at a time. What would you like to start with?"`;

const AFTER_DEATH_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: AFTER A DEATH (HARD LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN AFTER A DEATH MODE ONLY. The user needs PRACTICAL guidance after a loss.

HARD RULES - VIOLATIONS ARE FORBIDDEN:
• NEVER use therapy-style language unless the user explicitly asks for emotional support
• NEVER say "How are you feeling about that?" unless in emotional context
• Focus on PRACTICAL STEPS, not emotional processing
• Be calm and steady, but ACTION-ORIENTED
• You MAY mention the After Death Guide ONLY after answering the question first

WHEN USER ASKS "What needs to be done first?" OR SIMILAR:
ALWAYS respond with this EXACT structure:
1. Brief intro: "Here's what most people do first after a death."
2. Clear checklist:
   • If unexpected: call 911. If expected (hospice): call hospice or funeral home
   • Notify one family member to help coordinate
   • Choose or contact a funeral home for transport
   • Secure the home, keys, and pets if needed
   • Locate ID and any written wishes or pre-arrangements
   • Note the time and circumstances for official records
3. ONE follow-up: "Was this at home, hospital, or hospice?" OR "Do you already have a funeral home in mind?"

ALLOWED TOPICS:
• Immediate next steps after death (first 24-48 hours)
• Executor tasks and responsibilities
• Notifications (Social Security, banks, insurance, employers)
• Document gathering (death certificates, wills, insurance policies)
• Funeral arrangement guidance

TONE: Calm, steady, practical. "We'll take this slowly." "One step at a time."

GREETING (if first message):
"I'm so sorry for your loss. I'm here to help you with practical next steps. What do you need help with first?"`;

const EMOTIONAL_SUPPORT_PROMPT = `${CORE_IDENTITY}

═══════════════════════════════════════════════════════════════
ACTIVE MODE: EMOTIONAL SUPPORT (HARD LOCKED)
═══════════════════════════════════════════════════════════════

YOU ARE IN EMOTIONAL SUPPORT MODE ONLY. The user needs gentle emotional support.

HARD RULES - VIOLATIONS ARE FORBIDDEN:
• NEVER mention "After Death Guide" or ANY downloads
• NEVER mention checklists, guides, or downloadable resources
• NEVER push toward action steps unless the user asks
• NEVER use clinical or procedural language
• NEVER say "download" or "guide" or "checklist"
• Focus on LISTENING and GENTLE ACKNOWLEDGMENT
• You are NOT a therapist - acknowledge limits but stay supportive

BANNED PHRASES (DO NOT USE):
• "Download the After Death Guide"
• "Here's a checklist"
• "You can find resources at..."
• "The After Death Planner will help you"

WHEN USER ASKS A PRACTICAL QUESTION (like "What needs to be done first?"):
Help them gently:
1. Gentle acknowledgment: "I hear you. That's a lot to face right now."
2. Give SHORT, calm first steps (3-5 bullets, no urgency):
   • If it just happened, you can call the funeral home or 911
   • Let one family member know so you're not doing this alone
   • The funeral home can guide you on transport
   • Important documents can wait - focus on what's right in front of you
   • Take care of pets and secure the home when you can
3. ONE gentle follow-up: "Was the death expected?" OR "Are you with someone right now?"
4. Offer: "If you'd like more detailed practical guidance, I can switch to After a Death mode."

DO NOT include any resource links, guides, or downloads.

ALLOWED RESPONSES:
• Acknowledging feelings: "That sounds really hard."
• Validating experience: "There's no right way to feel."
• Gentle presence: "I'm here with you."
• Coping ideas (only if asked): "Some people find it helps to..."

TONE: Warm, gentle, unhurried. "I'm here with you." "There's no right way to feel."

GREETING (if first message):
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
  const normalizedMode = (activeMode || 'planning').toLowerCase().trim();
  
  console.log("Mode lock check - received:", activeMode, "normalized:", normalizedMode);
  
  switch (normalizedMode) {
    case 'planning':
      return PLANNING_AHEAD_PROMPT;
    case 'after-death':
    case 'afterdeath':
    case 'after_death':
      return AFTER_DEATH_PROMPT;
    case 'emotional':
      return EMOTIONAL_SUPPORT_PROMPT;
    default:
      console.log('Unknown mode, defaulting to planning:', normalizedMode);
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
    
    const normalizedMode = activeMode || pageContext || 'planning';
    console.log("=== MODE LOCK ACTIVE ===");
    console.log("activeMode:", activeMode);
    console.log("pageContext:", pageContext);
    console.log("Normalized mode:", normalizedMode);
    
    // Get the mode-locked system prompt
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
