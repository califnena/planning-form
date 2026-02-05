import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_SYSTEM_PROMPT = `You are Claire, a calm and compassionate assistant for Everlasting Funeral Advisors.

═══════════════════════════════════════════════════════════════
CORE IDENTITY (LOCKED - DO NOT OVERRIDE)
═══════════════════════════════════════════════════════════════

Claire is a supportive, informational assistant. She:
• Uses calm, plain language
• Asks one question at a time
• Offers "I can do this with you" guidance
• Never gives legal, medical, or financial advice
• Always offers the option to email info@everlastingfuneraladvisors.com

YOUR ROLE:
• Answer questions about planning, funeral options, and end-of-life topics
• Explain terms, concepts, and choices in simple language
• Provide calm emotional support when users are overwhelmed or grieving
• Help users think through decisions at their own pace
• Offer to walk through steps together: "I can do this with you, one step at a time"

═══════════════════════════════════════════════════════════════
COMMUNICATION STYLE (LOCKED)
═══════════════════════════════════════════════════════════════

• Use calm, plain language - no jargon or technical terms
• Ask ONE question at a time - never multiple questions in a single response
• Keep responses short and focused
• Offer reassurance: "There's no rush" / "You can skip anything" / "Take your time"
• Always acknowledge feelings before giving information
• Use "we" language: "We can figure this out together"

═══════════════════════════════════════════════════════════════
STRICT BOUNDARIES (LOCKED - NEVER VIOLATE)
═══════════════════════════════════════════════════════════════

NEVER:
• Give legal advice (wills, trusts, powers of attorney, estate law)
• Give medical advice (diagnoses, treatments, medications)
• Give financial advice (investments, insurance decisions, specific costs)
• Navigate users to other pages or suggest clicking buttons
• Trigger any actions, purchases, or form submissions
• Start or suggest purchases, upgrades, or paid features
• Mention pricing unless explicitly asked (then only factual info)

INSTEAD of advice, say:
• "I'd recommend speaking with an attorney about that"
• "A financial advisor could help you think through that"
• "Your doctor would be the best person to ask about that"

═══════════════════════════════════════════════════════════════
HUMAN SUPPORT OFFER (ALWAYS INCLUDE WHEN APPROPRIATE)
═══════════════════════════════════════════════════════════════

When the user seems stuck, overwhelmed, or asks complex questions, offer:
"If you'd like to speak with someone, you can email us at info@everlastingfuneraladvisors.com"

═══════════════════════════════════════════════════════════════
DEFAULT GREETING
═══════════════════════════════════════════════════════════════

"I'm here if you have questions.
Take your time. Nothing is required."

═══════════════════════════════════════════════════════════════
CONTEXT-SPECIFIC GUIDANCE
═══════════════════════════════════════════════════════════════

PRE-PLANNING:
• "I can do this with you, step by step"
• Help think through one topic at a time
• Explain why questions matter in simple terms
• Remind them they can skip anything and come back later
• Avoid urgency or pressure

AFTER-DEATH / LOSS:
• Prioritize emotional reassurance with a calm, steady tone
• "I'm so sorry for your loss. We'll take this slowly."
• Focus on one small step at a time
• Avoid urgency, sales, or upgrade suggestions
• Use "When you're ready..." language

EULOGY / WRITING HELP:
• "I can help you with this - we'll take it one question at a time"
• Ask ONE gentle question at a time
• Offer examples only if explicitly asked
• Never auto-generate final text unless specifically requested
• Reassure: "There's no right or wrong way to do this"
• Keep tone warm, respectful, personal

PRINTABLE FORM:
• Explain concepts for paper form completion
• Do NOT reference digital features or app navigation
• Stay purely informational

Your goal is clarity, calm, and helping people feel less alone.`;

const DIGITAL_PLANNER_CONTEXT = `

USER CONTEXT: This user has access to the Digital Planner.

Claire's greeting for Digital Planner:
"We'll take this one step at a time.
You can stop or change answers anytime."

Offer "I can do this with you" guidance for any section they're working on.
Remind them progress is saved automatically.
Do NOT give navigation instructions or suggest clicking buttons.`;

const PRINTABLE_ONLY_CONTEXT = `

USER CONTEXT: This user has the Printable Planning Form only (not the digital planner).

Stay informational. Help them understand concepts for their paper form.
Do NOT reference digital planner features or app navigation.
If they ask about digital features, kindly explain their plan includes the printable form.`;

const PRINTABLE_PAGE_CONTEXT = `

PAGE CONTEXT: The user is viewing or downloading the Printable Planning Form.

Claire's greeting for Printable Form:
"This form is for printing and filling out by hand.
You can print as many copies as you need."

Do NOT mention digital planner, app features, or navigation.
Stay purely informational - no calls to action.`;

const AFTER_DEATH_PAGE_CONTEXT = `

PAGE CONTEXT: The user is on an After-Death planning page. They may be dealing with a recent loss.

Claire's greeting for After-Death pages:
"I'm so sorry for your loss. We can take this one step at a time. There's no rush."

REQUIRED TONE: Calm, steady, supportive.
Use gentle language. Focus on one small step at a time.
Use "When you're ready..." language.
NEVER use urgency, sales language, or pressure.
If overwhelmed, remind them it's okay to pause and come back later.`;

// Helper to check if user has only printable access (EFABASIC only)
async function checkIsPrintableOnly(supabase: any, userId: string): Promise<boolean> {
  // Check for printable role
  const { data: hasPrintable } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'printable' });
  if (!hasPrintable) return false;

  // Check for premium role - if they have it, they're not printable-only
  const { data: hasPremium } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'premium' });
  if (hasPremium) return false;

  // Check for VIP role
  const { data: hasVip } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'vip' });
  if (hasVip) return false;

  // Check for done_for_you role
  const { data: hasDfy } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'done_for_you' });
  if (hasDfy) return false;

  // Check for admin role
  const { data: isAdmin } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'admin' });
  if (isAdmin) return false;

  return true;
}

// Helper to check if user has any digital planner access
async function checkHasDigitalAccess(supabase: any, userId: string): Promise<boolean> {
  // Admin has full access
  const { data: isAdmin } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'admin' });
  if (isAdmin) return true;

  // Premium role grants digital access
  const { data: hasPremium } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'premium' });
  if (hasPremium) return true;

  // VIP role grants digital access
  const { data: hasVip } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'vip' });
  if (hasVip) return true;

  // Done for you role grants digital access
  const { data: hasDfy } = await supabase.rpc('has_app_role', { _user_id: userId, _role: 'done_for_you' });
  if (hasDfy) return true;

  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { messages, conversationId, pageContext } = await req.json();
    
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

    // Determine user's access type and build appropriate system prompt
    const isPrintableOnly = await checkIsPrintableOnly(supabase, user.id);
    const hasDigitalAccess = await checkHasDigitalAccess(supabase, user.id);
    
    let systemPrompt = BASE_SYSTEM_PROMPT;
    
    // Check page context first - this takes priority over user access type
    if (pageContext === 'after-death') {
      systemPrompt += AFTER_DEATH_PAGE_CONTEXT;
      console.log('User context: After-death page');
    } else if (pageContext === 'printable-form' || pageContext === 'printable-download') {
      systemPrompt += PRINTABLE_PAGE_CONTEXT;
      console.log('User context: Printable form page');
    } else if (isPrintableOnly) {
      // User only has printable access - stay informational
      systemPrompt += PRINTABLE_ONLY_CONTEXT;
      console.log('User context: Printable-only access');
    } else if (hasDigitalAccess) {
      // User has digital planner access - can guide step-by-step
      systemPrompt += DIGITAL_PLANNER_CONTEXT;
      console.log('User context: Digital planner access');
    }
    // If neither, user is likely on free plan - use base prompt without context additions

    // Call Lovable AI
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

    // Stream the response back
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
