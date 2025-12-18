import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for IP addresses (privacy-preserving)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for writes (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { visitorId, orgId, path, referrer } = await req.json();
    
    if (!visitorId) {
      console.error('Missing visitorId');
      return new Response(JSON.stringify({ error: 'visitorId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get client IP from headers (Supabase/Deno edge headers)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';
    
    const userAgent = req.headers.get('user-agent') || '';
    
    // Extract user_id from JWT if present
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await createClient(
          supabaseUrl, 
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        ).auth.getUser();
        userId = user?.id || null;
      } catch (e) {
        console.log('Could not extract user from token:', e);
      }
    }

    // Geo lookup using ipapi.co (free tier: 30k requests/month)
    let city: string | null = null;
    let region: string | null = null;
    let country: string | null = null;
    
    if (clientIP && clientIP !== 'unknown' && clientIP !== '127.0.0.1') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`, {
          headers: { 'User-Agent': 'EverlastingApp/1.0' }
        });
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (!geoData.error) {
            city = geoData.city || null;
            region = geoData.region || null;
            country = geoData.country_name || null;
          }
        }
      } catch (geoError) {
        console.log('Geo lookup failed (non-critical):', geoError);
      }
    }

    // Hash IP for privacy
    const ipHash = clientIP !== 'unknown' ? await hashIP(clientIP) : null;

    console.log(`Tracking visit: visitor=${visitorId}, user=${userId || 'anonymous'}, path=${path}, location=${city}/${region}/${country}`);

    // Upsert visitor record
    const { error: visitorError } = await supabase
      .from('visitors')
      .upsert({
        visitor_id: visitorId,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        total_visits: 1
      }, {
        onConflict: 'visitor_id',
        ignoreDuplicates: false
      });

    if (visitorError) {
      console.error('Error upserting visitor:', visitorError);
    }

    // Update last_seen_at for existing visitors
    await supabase
      .from('visitors')
      .update({ 
        last_seen_at: new Date().toISOString()
      })
      .eq('visitor_id', visitorId);
    // For now, we'll track visits through visit_events count
    
    // Insert visit event
    const { error: eventError } = await supabase
      .from('visit_events')
      .insert({
        visitor_id: visitorId,
        user_id: userId,
        org_id: orgId || null,
        path: path || null,
        referrer: referrer || null,
        city,
        region,
        country,
        ip_hash: ipHash,
        user_agent: userAgent
      });

    if (eventError) {
      console.error('Error inserting visit event:', eventError);
      return new Response(JSON.stringify({ error: 'Failed to track visit' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update visitor total_visits count
    const { data: visitCount } = await supabase
      .from('visit_events')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_id', visitorId);

    if (visitCount !== null) {
      await supabase
        .from('visitors')
        .update({ 
          total_visits: visitCount,
          last_seen_at: new Date().toISOString()
        })
        .eq('visitor_id', visitorId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      location: { city, region, country }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in track-visit:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
