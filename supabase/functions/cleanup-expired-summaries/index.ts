 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     // Delete expired summaries
     const { data, error } = await supabase
       .from("planning_summaries")
       .delete()
       .lt("expires_at", new Date().toISOString())
       .select("id");
 
     if (error) {
       console.error("Error deleting expired summaries:", error);
       return new Response(
         JSON.stringify({ error: "Failed to cleanup expired summaries" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const deletedCount = data?.length || 0;
     console.log(`Deleted ${deletedCount} expired summaries`);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         deleted_count: deletedCount,
         timestamp: new Date().toISOString()
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Cleanup error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });