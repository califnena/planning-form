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
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Parse request body
    let body: { confirm?: string } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate confirmation
    if (body.confirm !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Confirmation required. Please send { "confirm": "DELETE" } to proceed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.log(`Starting account deletion for user: ${userId}`);

    // Create service role client for deletions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Helper function to safely delete from a table
    const safeDelete = async (
      table: string, 
      column: string, 
      value: string | string[],
      useIn: boolean = false
    ): Promise<{ deleted: number; error?: string }> => {
      try {
        let query = supabase.from(table).delete();
        
        if (useIn && Array.isArray(value)) {
          if (value.length === 0) return { deleted: 0 };
          query = query.in(column, value);
        } else {
          query = query.eq(column, value);
        }
        
        const { data, error } = await query.select('id');
        
        if (error) {
          // Ignore "relation does not exist" errors
          if (error.message.includes('does not exist')) {
            console.log(`Table ${table} does not exist, skipping`);
            return { deleted: 0 };
          }
          console.error(`Error deleting from ${table}:`, error.message);
          return { deleted: 0, error: error.message };
        }
        
        const count = data?.length || 0;
        console.log(`Deleted ${count} rows from ${table}`);
        return { deleted: count };
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err);
        return { deleted: 0, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    };

    const errors: string[] = [];

    // 1. Get conversation IDs for this user (for assistant_messages)
    const { data: conversations } = await supabase
      .from('assistant_conversations')
      .select('id')
      .eq('user_id', userId);
    const conversationIds = (conversations || []).map((c: any) => c.id);

    // 2. Get share_link IDs for this user (for share_link_access_log)
    const { data: shareLinks } = await supabase
      .from('share_links')
      .select('id')
      .eq('user_id', userId);
    const shareLinkIds = (shareLinks || []).map((s: any) => s.id);

    // 3. Get case IDs for this user (for tasks, contacts, documents)
    const { data: cases } = await supabase
      .from('cases')
      .select('id')
      .eq('user_id', userId);
    const caseIds = (cases || []).map((c: any) => c.id);

    // 4. Get plan IDs for this user (for plan_revisions, plan_section_selections)
    const { data: plans } = await supabase
      .from('plans')
      .select('id')
      .eq('owner_user_id', userId);
    const planIds = (plans || []).map((p: any) => p.id);

    // Delete in order to respect foreign key constraints
    console.log('Deleting assistant_messages...');
    if (conversationIds.length > 0) {
      const result = await safeDelete('assistant_messages', 'conversation_id', conversationIds, true);
      if (result.error) errors.push(`assistant_messages: ${result.error}`);
    }

    console.log('Deleting assistant_conversations...');
    const convResult = await safeDelete('assistant_conversations', 'user_id', userId);
    if (convResult.error) errors.push(`assistant_conversations: ${convResult.error}`);

    console.log('Deleting share_link_access_log...');
    if (shareLinkIds.length > 0) {
      const result = await safeDelete('share_link_access_log', 'share_link_id', shareLinkIds, true);
      if (result.error) errors.push(`share_link_access_log: ${result.error}`);
    }

    console.log('Deleting share_links...');
    const shareResult = await safeDelete('share_links', 'user_id', userId);
    if (shareResult.error) errors.push(`share_links: ${shareResult.error}`);

    console.log('Deleting generated_documents...');
    const genDocsResult = await safeDelete('generated_documents', 'user_id', userId);
    if (genDocsResult.error) errors.push(`generated_documents: ${genDocsResult.error}`);

    console.log('Deleting documents...');
    if (caseIds.length > 0) {
      const result = await safeDelete('documents', 'case_id', caseIds, true);
      if (result.error) errors.push(`documents: ${result.error}`);
    }

    console.log('Deleting tasks...');
    if (caseIds.length > 0) {
      const result = await safeDelete('tasks', 'case_id', caseIds, true);
      if (result.error) errors.push(`tasks: ${result.error}`);
    }

    console.log('Deleting contacts...');
    if (caseIds.length > 0) {
      const result = await safeDelete('contacts', 'case_id', caseIds, true);
      if (result.error) errors.push(`contacts: ${result.error}`);
    }

    console.log('Deleting cases...');
    const casesResult = await safeDelete('cases', 'user_id', userId);
    if (casesResult.error) errors.push(`cases: ${casesResult.error}`);

    console.log('Deleting plan_section_selections...');
    const pssResult = await safeDelete('plan_section_selections', 'user_id', userId);
    if (pssResult.error) errors.push(`plan_section_selections: ${pssResult.error}`);

    console.log('Deleting plan_revisions...');
    if (planIds.length > 0) {
      const result = await safeDelete('plan_revisions', 'plan_id', planIds, true);
      if (result.error) errors.push(`plan_revisions: ${result.error}`);
    }

    console.log('Deleting plans...');
    const plansResult = await safeDelete('plans', 'owner_user_id', userId);
    if (plansResult.error) errors.push(`plans: ${plansResult.error}`);

    console.log('Deleting user_settings...');
    const settingsResult = await safeDelete('user_settings', 'user_id', userId);
    if (settingsResult.error) errors.push(`user_settings: ${settingsResult.error}`);

    console.log('Deleting profiles...');
    const profilesResult = await safeDelete('profiles', 'id', userId);
    if (profilesResult.error) errors.push(`profiles: ${profilesResult.error}`);

    // Delete additional user-related tables
    console.log('Deleting subscriptions...');
    const subsResult = await safeDelete('subscriptions', 'user_id', userId);
    if (subsResult.error) errors.push(`subscriptions: ${subsResult.error}`);

    console.log('Deleting purchases...');
    const purchasesResult = await safeDelete('purchases', 'user_id', userId);
    if (purchasesResult.error) errors.push(`purchases: ${purchasesResult.error}`);

    console.log('Deleting invoices...');
    const invoicesResult = await safeDelete('invoices', 'user_id', userId);
    if (invoicesResult.error) errors.push(`invoices: ${invoicesResult.error}`);

    console.log('Deleting appointments...');
    const appointmentsResult = await safeDelete('appointments', 'user_id', userId);
    if (appointmentsResult.error) errors.push(`appointments: ${appointmentsResult.error}`);

    console.log('Deleting audit_log...');
    const auditResult = await safeDelete('audit_log', 'user_id', userId);
    if (auditResult.error) errors.push(`audit_log: ${auditResult.error}`);

    console.log('Deleting section_archives...');
    const archivesResult = await safeDelete('section_archives', 'user_id', userId);
    if (archivesResult.error) errors.push(`section_archives: ${archivesResult.error}`);

    console.log('Deleting cost_estimates...');
    const costResult = await safeDelete('cost_estimates', 'user_id', userId);
    if (costResult.error) errors.push(`cost_estimates: ${costResult.error}`);

    console.log('Deleting song_orders...');
    const songResult = await safeDelete('song_orders', 'user_id', userId);
    if (songResult.error) errors.push(`song_orders: ${songResult.error}`);

    // Check for critical errors before deleting auth user
    if (errors.length > 0) {
      console.error('Errors during data deletion:', errors);
      // Continue anyway - we want to delete the auth user even if some data couldn't be removed
    }

    // Finally, delete the auth user
    console.log('Deleting auth user...');
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'We could not complete deletion. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Account deletion completed for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ error: 'We could not complete deletion. Please contact support.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
