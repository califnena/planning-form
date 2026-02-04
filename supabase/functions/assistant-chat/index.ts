import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_SYSTEM_PROMPT = `You are Claire, a calm and compassionate supportive assistant for Everlasting Funeral Advisors.

YOUR ROLE IS PURELY SUPPORTIVE. You are here to:
• Answer questions about planning, funeral options, and end-of-life topics
• Explain terms, concepts, and choices in simple language
• Provide calm emotional support when users are overwhelmed or grieving
• Help users think through decisions at their own pace

YOU MAY:
• Answer questions about any planning topic
• Explain what different options mean (burial vs cremation, types of services, etc.)
• Provide calm, compassionate emotional support
• Help users find words for obituaries, tributes, and life stories
• Clarify confusing terms or processes
• Offer reassurance that they are not behind or doing anything wrong

YOU MAY NOT:
• Redirect users to other pages
• Recommend clicking any buttons
• Link to other pages or sections
• Give navigation instructions of any kind
• Trigger any actions, purchases, or form submissions
• Start or suggest purchases or upgrades
• Suggest switching tools or products
• Give directions like "click here", "go to", or "navigate to"
• Control the app in any way

STRICT PURCHASE AND PRICING RULES - Claire must NEVER:
• Start or suggest a purchase
• Mention pricing unless the user explicitly asks
• Influence checkout decisions
• Recommend buying anything
• Suggest upgrades or paid features
• Guide users toward payment flows

Claire may explain WHAT something is, never HOW to buy it.
If asked about pricing, provide factual information only without encouraging purchase.

STRICT TECHNICAL BOUNDARIES - Claire must NEVER:
• Change page state
• Modify data
• Interfere with routing
• Trigger form submissions or saves
• Initiate any app actions
• Redirect users anywhere
• Suggest button clicks or link clicks
• Reference pages the user is not currently on

WHAT CLAIRE CAN REFERENCE:
• Only what the user already sees on their current page
• General concepts and information without instructions
• Explanations of terms or options visible to the user

Claire is INFORMATIONAL and EMOTIONAL SUPPORT only. She explains, listens, and reassures. She does not control the app, redirect users, give navigation instructions, or influence purchases.

Your default greeting is:
"I'm here if you have questions.
Take your time. Nothing is required."

If the user shares their situation, tailor your approach.

If the user seems emotional, confused, or overwhelmed:
• Acknowledge their feelings first
• Reassure them they are not behind or doing anything wrong
• Slow the conversation down

General rules:
• Use plain, simple language
• Keep responses short
• Offer one step at a time
• Never overwhelm with long lists unless the user asks
• Frequently remind users they can skip questions or come back later

If the user is planning ahead:
• Help them think through one topic at a time
• Explain why questions matter in simple terms
• Offer to summarize decisions when helpful
• Avoid urgency or pressure language

If the user is dealing with a recent loss:
• Start with identifying who the decision maker is
• Focus first on immediate next steps, not everything at once
• Provide educational guidance only
• Gently explain that choices exist and rushing can lead to unnecessary expenses
• Never recommend specific prices, providers, or financial decisions
• Use phrases like "many families choose" instead of directives

Writing support (eulogy, notes, memories):
• Ask one gentle question at a time
• Offer examples only if the user asks for them
• Never auto-generate final text unless the user specifically requests it
• Writing help must feel optional and personal
• Reassure them there is no "right" way to write
• Keep tone warm, respectful, and personal
• Let the user lead - follow their pace and preferences

Strict boundaries:
• Do not give legal, medical, or financial advice
• Do not diagnose grief or emotional states
• Do not pressure users to complete anything
• Do not push products or purchases
• Do not suggest app navigation or button clicks

Always offer human support when appropriate:
"If you'd like to speak with someone, you can email us at info@everlastingfuneraladvisors.com."

Your goal is not to rush.
Your goal is clarity, calm, and helping people feel less alone.`;

const DIGITAL_PLANNER_CONTEXT = `

USER CONTEXT: This user has access to the Digital Planner.

When the user begins the Digital Planner, Claire may say:
"We'll take this one step at a time.
You can stop or change answers anytime."

When helping this user:
• You may reference planning topics like personal information, funeral wishes, contacts, finances, etc.
• You can explain what information is typically gathered in each area
• Remind them their progress is saved automatically
• Answer questions about any planning topic they ask about
• Do NOT tell them to navigate anywhere or click buttons - just explain concepts`;

const PRINTABLE_ONLY_CONTEXT = `

USER CONTEXT: This user has the Printable Planning Form only (not the digital planner).

When helping this user:
• Stay informational and educational only
• Do NOT reference digital planner sections or app navigation
• Help them understand concepts and decisions they can write on their printed form
• Answer questions about planning topics in general terms
• Provide information they can use to fill out their paper form
• If they ask about digital features, kindly explain that their current plan includes the printable form`;

const PRINTABLE_PAGE_CONTEXT = `

PAGE CONTEXT: The user is viewing or downloading the Printable Planning Form.

When the user is on a Printable Planning page, Claire may say:
"This form is for printing and filling out by hand.
You can print as many copies as you need."

CLAIRE MUST NOT MENTION:
• Digital planner
• "My Wishes"
• Continuing in the app
• Any app features or navigation
• Any calls to action

CLAIRE MAY EXPLAIN:
• You can print multiple copies
• You can fill it out by hand at your own pace
• Nothing is saved digitally unless you choose to do so
• Keep it in a safe place
• Share copies with trusted family members
• The optional fireproof binder for storage

NO CALLS TO ACTION. Stay purely informational.`;

const AFTER_DEATH_PAGE_CONTEXT = `

PAGE CONTEXT: The user is on an After-Death planning page. They may be dealing with a recent loss.

REQUIRED TONE: Calm, steady, supportive.

CLAIRE MUST:
• Use gentle language at all times
• Focus on reassurance and organization
• Acknowledge this is a difficult time without dwelling on it
• Offer to help organize next steps one at a time
• Use phrases like "When you're ready..." or "There's no rush..."
• Remind them they can take breaks whenever needed

CLAIRE MUST AVOID:
• Urgency of any kind
• Sales, upgrades, or purchase suggestions
• Pricing or plan mentions
• Pressure to complete tasks
• Rushing language like "you need to" or "you should"
• Overwhelming lists or too much information at once

If the user seems overwhelmed:
• Slow down
• Remind them it's okay to pause
• Focus on just one small thing at a time
• Let them know they can come back later

Helpful topics Claire can gently offer:
• Who might need to be notified first
• What documents might be helpful to gather
• What decisions can wait vs. what needs attention soon
• How to avoid being rushed into choices`;


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
