import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WritingAction = "help" | "rewrite" | "shorter" | "warmer" | "spelling";
type ToneOption = "calm" | "warm" | "simple";
type LengthOption = "short" | "medium" | "detailed";

interface RequestBody {
  action: WritingAction;
  currentText: string;
  guidance?: string;
  tone?: ToneOption;
  length?: LengthOption;
  fieldLabel: string;
  fieldContext?: string;
  userName?: string;
}

function buildSystemPrompt(fieldContext: string): string {
  const base = `You are a compassionate writing assistant helping people with end-of-life planning documents. 
Your role is to help them express their thoughts, wishes, and memories in a warm, respectful, and clear way.

IMPORTANT RULES:
- Never draft legal documents, wills, trusts, or provide legal advice
- Never ask for or include SSNs, account numbers, passwords, or sensitive financial details
- Keep language plain, respectful, and calm
- Avoid medical claims or diagnoses
- Focus on personal expression, memories, wishes, and values
- Be culturally sensitive and inclusive of all beliefs and traditions`;

  if (fieldContext === "funeral_wishes") {
    return `${base}

You are helping with FUNERAL WISHES content. This includes:
- Service preferences and arrangements
- Disposition wishes (burial, cremation, etc.)
- Music, readings, and personal touches
- Obituary drafts
- Instructions for loved ones
- Memorial preferences

Keep the tone gentle and focus on helping them express their preferences clearly.`;
  }

  if (fieldContext === "life_story") {
    return `${base}

You are helping with LIFE STORY & LEGACY content. This includes:
- Biography and life story
- Eulogy drafts
- Values and lessons to pass on
- Cherished memories
- Letters to family
- How they want to be remembered

Help them capture their story with warmth and authenticity.`;
  }

  return base;
}

function buildUserPrompt(params: RequestBody): string {
  const { action, currentText, guidance, tone, length, fieldLabel, userName } = params;
  
  const toneInstructions: Record<ToneOption, string> = {
    calm: "Use a calm, peaceful, and measured tone.",
    warm: "Use a warm, loving, and heartfelt tone.",
    simple: "Use very simple, plain language. Short sentences. Easy to understand."
  };

  const lengthInstructions: Record<LengthOption, string> = {
    short: "Keep it brief - 2-3 sentences or a short paragraph.",
    medium: "Write a moderate length - 1-2 paragraphs.",
    detailed: "Write a more detailed response - 3-4 paragraphs with specific details."
  };

  const userNameMention = userName ? `The person's name is ${userName}.` : "";

  switch (action) {
    case "help":
      return `Help write content for the "${fieldLabel}" field.
${userNameMention}
${guidance ? `The user wants to include: ${guidance}` : "The user hasn't provided specific guidance, so create a thoughtful first draft."}
${currentText ? `They've started with: "${currentText}"` : "Start fresh."}

${toneInstructions[tone || "warm"]}
${lengthInstructions[length || "medium"]}

Write the content directly - no explanations or preamble. Just the text they can use.`;

    case "rewrite":
      return `Rewrite this text for the "${fieldLabel}" field:
"${currentText}"

${userNameMention}
${guidance ? `Additional guidance: ${guidance}` : ""}

${toneInstructions[tone || "warm"]}
${lengthInstructions[length || "medium"]}

Provide only the rewritten text - no explanations.`;

    case "shorter":
      return `Make this text shorter while keeping the key message for the "${fieldLabel}" field:
"${currentText}"

Keep the same meaning and tone, just more concise. Provide only the shortened text.`;

    case "warmer":
      return `Rewrite this text to be warmer and more heartfelt for the "${fieldLabel}" field:
"${currentText}"

Add more emotional warmth and personal touch while keeping the core message. Provide only the rewritten text.`;

    case "spelling":
      return `Fix any spelling, grammar, and punctuation errors in this text for the "${fieldLabel}" field:
"${currentText}"

Keep the original meaning and style. Only fix errors. Provide only the corrected text.`;

    default:
      return `Help improve this text for the "${fieldLabel}" field: "${currentText}"`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { action, currentText, fieldContext } = body;

    // Validate required fields
    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For non-help actions, require current text
    if (action !== "help" && !currentText?.trim()) {
      return new Response(
        JSON.stringify({ error: "Current text is required for this action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(fieldContext || "general");
    const userPrompt = buildUserPrompt(body);

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
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error("No content generated");
    }

    return new Response(
      JSON.stringify({ generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Writing helper error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
