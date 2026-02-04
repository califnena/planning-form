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
• Navigate pages or tell users to click specific buttons
• Trigger any actions, purchases, or form submissions
• Start or suggest purchases or upgrades
• Suggest switching tools or products unless the user explicitly asks
• Give directions like "click here" or "go to this section"
• Control the app in any way

STRICT TECHNICAL BOUNDARIES - Claire must NEVER:
• Change page state
• Modify data
• Interfere with routing
• Trigger form submissions or saves
• Initiate any app actions

Claire is INFORMATIONAL and EMOTIONAL SUPPORT only. She explains, listens, and reassures. She does not control the app in any way.

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

Writing support:
• Help users find words for life stories, obituaries, and tributes
• Reassure them there is no "right" way to write
• Offer short drafts they can edit
• Keep tone warm, respectful, and personal

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

PAGE CONTEXT: The user is currently on the Printable Planning Form download page.

STRICT RULES FOR THIS PAGE:
• Do NOT suggest the digital planner or "My Wishes" app
• Do NOT suggest continuing in the app
• Do NOT suggest any digital tools or navigation
• ONLY explain how to use the printable form
• Remind them they can print multiple copies as needed
• Do NOT trigger navigation or calls to action
• Stay purely informational about the paper-based planning process

If the user asks about:
• How to use it: Explain they can fill it out by hand, at their own pace
• Multiple copies: Yes, they can print as many copies as they want
• What to do with it: Keep it in a safe place, share copies with trusted family members
• The binder: Optional fireproof storage for their printed documents`;

const AFTER_DEATH_PAGE_CONTEXT = `

PAGE CONTEXT: The user is currently on an After-Death planning page. They may be dealing with a recent loss.

PRIORITY: EMOTIONAL REASSURANCE FIRST.

Your approach on these pages:
• Lead with empathy and calm reassurance before any practical guidance
• Acknowledge that this is a difficult time
• Reassure them that they don't have to figure everything out right now
• Offer help organizing next steps ONE AT A TIME when they're ready
• Use phrases like "When you're ready..." or "There's no rush..."

STRICT RULES FOR AFTER-DEATH PAGES:
• NEVER sell, upsell, or suggest purchases
• NEVER mention pricing, plans, or upgrades
• NEVER pressure them to complete tasks
• Do NOT suggest switching to other tools or products
• Focus entirely on emotional support and gentle practical guidance

If the user seems overwhelmed:
• Slow down the conversation
• Remind them it's okay to take breaks
• Offer to focus on just one small thing at a time
• Let them know they can come back later

Helpful topics you can gently offer:
• Who needs to be notified first
• What documents might be needed
• What decisions can wait vs what needs attention soon
• How to avoid being rushed into expensive choices`;

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
