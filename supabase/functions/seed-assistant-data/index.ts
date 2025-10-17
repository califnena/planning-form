import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sampleFAQs = [
  {
    category: "Getting Started",
    question: "What is Everlasting?",
    answer: "Everlasting is a comprehensive end-of-life planning platform that helps you organize your wishes, documents, and important information in one secure place. It includes tools for funeral planning, legal documents, financial accounts, digital assets, and messages to loved ones.",
    keywords: ["about", "platform", "overview", "what is"]
  },
  {
    category: "Planning",
    question: "How do I start planning my funeral?",
    answer: "Navigate to the Funeral Wishes section in your planner. There you can specify your preferences for burial or cremation, ceremony details, music choices, and funding sources. You can also upload photos and write specific instructions.",
    keywords: ["funeral", "planning", "burial", "cremation", "ceremony"]
  },
  {
    category: "Documents",
    question: "How do I download my plan as a PDF?",
    answer: "Click the 'Download PDF' button in the top menu of your planner. You can choose between a filled PDF (with your information already entered) or a blank form that can be filled out manually. You can also email your plan directly to loved ones.",
    keywords: ["pdf", "download", "export", "print", "document"]
  },
  {
    category: "Account",
    question: "How do I share my plan with family members?",
    answer: "You can email your plan directly using the 'Email Plan' button, or download it and share the PDF file. For collaborative access, you can add executor permissions to family members through the Contacts section.",
    keywords: ["share", "family", "email", "access", "permissions"]
  },
  {
    category: "Security",
    question: "Is my information secure?",
    answer: "Yes! All your data is encrypted and stored securely using industry-standard security practices. Only you have access to your information unless you explicitly share it. We never sell or share your personal data with third parties.",
    keywords: ["security", "privacy", "encryption", "safe", "protected"]
  },
  {
    category: "Pricing",
    question: "What subscription plans are available?",
    answer: "Everlasting offers three plans: Free (basic planning features), VIP Monthly ($9.99/month with AI coach and priority support), and VIP Annual ($99/year - save 17% with AI coach and priority support). Upgrade anytime from your Profile page.",
    keywords: ["pricing", "subscription", "cost", "plan", "upgrade", "vip"]
  }
];

const sampleArticles = [
  {
    title: "Complete Guide to End-of-Life Planning",
    body: `End-of-life planning is an important process that ensures your wishes are known and your loved ones are prepared. This comprehensive guide covers:

1. **Personal Information**: Document your full legal name, birth details, Social Security number, and citizenship.

2. **Funeral Arrangements**: Specify your preferences for burial or cremation, ceremony type, music, and readings.

3. **Financial Accounts**: List all bank accounts, investment accounts, retirement funds, and insurance policies.

4. **Legal Documents**: Organize your will, trust documents, power of attorney, and healthcare directives.

5. **Digital Assets**: Document online accounts, passwords, and instructions for social media.

6. **Messages to Loved Ones**: Write personal letters or record video messages for family and friends.

7. **Property and Vehicles**: List all real estate, vehicles, and valuable possessions.

8. **Pets**: Make arrangements for the care of your pets.

The key is to be thorough and keep your plan updated as circumstances change.`,
    tags: ["guide", "planning", "comprehensive", "overview"]
  },
  {
    title: "How to Export Your Filled PDF",
    body: `Everlasting makes it easy to generate a professional PDF of your complete plan:

**Step 1**: Complete all relevant sections of your planner with your information.

**Step 2**: Click the "Download PDF" button in the top menu.

**Step 3**: Choose "Filled PDF" to get a document with all your information already entered.

**Alternative**: Choose "Blank Form" if you want a template that can be filled out manually.

The PDF includes:
- All your personal information
- Funeral wishes and arrangements
- Financial account details
- Contact information for loved ones
- Insurance policies
- Property details
- Digital assets
- Messages to family

You can save this PDF to your computer, print it, or share it with family members and your executor.`,
    tags: ["pdf", "export", "download", "tutorial"]
  },
  {
    title: "Setting Up Executor Access",
    body: `An executor is someone you trust to carry out your wishes after you pass away. Here's how to grant executor access in Everlasting:

**Adding an Executor**:
1. Go to the Contacts section
2. Add a professional contact with role "Executor"
3. Enter their contact information
4. They will be able to view (but not edit) your plan

**Multiple Executors**: You can have multiple people with executor access if desired.

**What Executors Can Access**: Executors can view all sections of your plan but cannot make changes. This ensures your wishes remain as you documented them.

**Removing Access**: You can remove executor access at any time from the Contacts section.

It's recommended to inform your executor that they have been designated and explain where they can access your plan.`,
    tags: ["executor", "access", "permissions", "sharing", "family"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert FAQs
    const { error: faqError } = await supabase
      .from('faqs')
      .upsert(sampleFAQs, { onConflict: 'question' });

    if (faqError) {
      console.error('FAQ insert error:', faqError);
    }

    // Insert KB articles
    const { error: kbError } = await supabase
      .from('kb_articles')
      .upsert(sampleArticles, { onConflict: 'title' });

    if (kbError) {
      console.error('KB insert error:', kbError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      faqs: sampleFAQs.length,
      articles: sampleArticles.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
