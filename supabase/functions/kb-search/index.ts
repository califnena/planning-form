import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1) Semantic search on KB articles (using helper function)
    const { data: kbResults, error: kbError } = await supabase
      .rpc('kb_semantic_search', { query_text: query, match_count: 5 });

    console.log('KB search results:', kbResults, kbError);

    // 2) Keyword search on FAQs
    const { data: faqResults, error: faqError } = await supabase
      .from('faqs')
      .select('id, category, question, answer')
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%,keywords.cs.{${query}}`)
      .limit(3);

    console.log('FAQ search results:', faqResults, faqError);

    // Format results
    const kb = (kbResults || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      snippet: item.snippet,
      source: 'KB',
      similarity: item.similarity
    }));

    const faqs = (faqResults || []).map((item: any) => ({
      id: item.id,
      title: item.question,
      snippet: item.answer.substring(0, 280),
      category: item.category,
      source: 'FAQ'
    }));

    return new Response(JSON.stringify({ kb, faqs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('KB search error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
