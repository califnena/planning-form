import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create anon client to validate user token
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Validate the user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Exporting data for user: ${userId}`);

    // Create service role client for reading data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all user data in parallel
    const [
      profilesResult,
      userSettingsResult,
      plansResult,
      planRevisionsResult,
      planSectionSelectionsResult,
      casesResult,
      generatedDocumentsResult,
      assistantConversationsResult,
      shareLinksResult,
    ] = await Promise.all([
      // profiles (id = user.id)
      supabase.from('profiles').select('*').eq('id', userId),
      
      // user_settings (user_id)
      supabase.from('user_settings').select('*').eq('user_id', userId),
      
      // plans (owner_user_id)
      supabase.from('plans').select('*').eq('owner_user_id', userId),
      
      // plan_revisions - need to join through plans
      supabase.from('plan_revisions').select('*, plans!inner(owner_user_id)').eq('plans.owner_user_id', userId),
      
      // plan_section_selections (user_id)
      supabase.from('plan_section_selections').select('*').eq('user_id', userId),
      
      // cases (user_id) - for getting related contacts, tasks, documents
      supabase.from('cases').select('*').eq('user_id', userId),
      
      // generated_documents (user_id)
      supabase.from('generated_documents').select('*').eq('user_id', userId),
      
      // assistant_conversations (user_id)
      supabase.from('assistant_conversations').select('*').eq('user_id', userId),
      
      // share_links (user_id)
      supabase.from('share_links').select('*').eq('user_id', userId),
    ]);

    // Get case IDs for related data
    const caseIds = (casesResult.data || []).map((c: any) => c.id);
    
    // Get share link IDs for access log
    const shareLinkIds = (shareLinksResult.data || []).map((s: any) => s.id);
    
    // Get conversation IDs for messages
    const conversationIds = (assistantConversationsResult.data || []).map((c: any) => c.id);

    // Fetch related data
    const [
      contactsResult,
      tasksResult,
      documentsResult,
      assistantMessagesResult,
      shareLinkAccessLogResult,
    ] = await Promise.all([
      // contacts (via case_id)
      caseIds.length > 0 
        ? supabase.from('contacts').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [], error: null }),
      
      // tasks (via case_id)
      caseIds.length > 0
        ? supabase.from('tasks').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [], error: null }),
      
      // documents (via case_id)
      caseIds.length > 0
        ? supabase.from('documents').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [], error: null }),
      
      // assistant_messages (via conversation_id)
      conversationIds.length > 0
        ? supabase.from('assistant_messages').select('*').in('conversation_id', conversationIds)
        : Promise.resolve({ data: [], error: null }),
      
      // share_link_access_log (via share_link_id)
      shareLinkIds.length > 0
        ? supabase.from('share_link_access_log').select('*').in('share_link_id', shareLinkIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Log any errors (but continue with available data)
    const errors: string[] = [];
    if (profilesResult.error) errors.push(`profiles: ${profilesResult.error.message}`);
    if (userSettingsResult.error) errors.push(`user_settings: ${userSettingsResult.error.message}`);
    if (plansResult.error) errors.push(`plans: ${plansResult.error.message}`);
    if (planRevisionsResult.error) errors.push(`plan_revisions: ${planRevisionsResult.error.message}`);
    if (planSectionSelectionsResult.error) errors.push(`plan_section_selections: ${planSectionSelectionsResult.error.message}`);
    if (casesResult.error) errors.push(`cases: ${casesResult.error.message}`);
    if (contactsResult.error) errors.push(`contacts: ${contactsResult.error.message}`);
    if (tasksResult.error) errors.push(`tasks: ${tasksResult.error.message}`);
    if (documentsResult.error) errors.push(`documents: ${documentsResult.error.message}`);
    if (generatedDocumentsResult.error) errors.push(`generated_documents: ${generatedDocumentsResult.error.message}`);
    if (assistantConversationsResult.error) errors.push(`assistant_conversations: ${assistantConversationsResult.error.message}`);
    if (assistantMessagesResult.error) errors.push(`assistant_messages: ${assistantMessagesResult.error.message}`);
    if (shareLinksResult.error) errors.push(`share_links: ${shareLinksResult.error.message}`);
    if (shareLinkAccessLogResult.error) errors.push(`share_link_access_log: ${shareLinkAccessLogResult.error.message}`);

    if (errors.length > 0) {
      console.warn('Some data could not be fetched:', errors);
    }

    // Build response payload
    const exportPayload = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      data: {
        profiles: profilesResult.data || [],
        user_settings: userSettingsResult.data || [],
        plans: plansResult.data || [],
        plan_revisions: (planRevisionsResult.data || []).map((r: any) => {
          // Remove the joined plans data
          const { plans, ...revision } = r;
          return revision;
        }),
        plan_section_selections: planSectionSelectionsResult.data || [],
        cases: casesResult.data || [],
        contacts: contactsResult.data || [],
        tasks: tasksResult.data || [],
        documents: documentsResult.data || [],
        generated_documents: generatedDocumentsResult.data || [],
        assistant_conversations: assistantConversationsResult.data || [],
        assistant_messages: assistantMessagesResult.data || [],
        share_links: shareLinksResult.data || [],
        share_link_access_log: shareLinkAccessLogResult.data || [],
      },
      ...(errors.length > 0 && { warnings: errors }),
    };

    console.log(`Export complete for user ${userId}. Tables exported: ${Object.keys(exportPayload.data).length}`);

    return new Response(JSON.stringify(exportPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
