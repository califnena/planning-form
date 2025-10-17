import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function makeICS(summary: string, starts_at: string, ends_at: string): string {
  const formatDate = (date: string) => {
    return date.replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Everlasting//Appointment//EN
BEGIN:VEVENT
SUMMARY:${summary}
DTSTART:${formatDate(starts_at)}
DTEND:${formatDate(ends_at)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { starts_at, ends_at, notes } = await req.json();

    if (!starts_at || !ends_at) {
      return new Response(JSON.stringify({ error: 'starts_at and ends_at are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        starts_at,
        ends_at,
        notes: notes || null,
        channel: 'native',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Appointment creation error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ics = makeICS('Everlasting Appointment', starts_at, ends_at);

    return new Response(JSON.stringify({ 
      ok: true, 
      appointment: data, 
      ics 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-appointment:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
