import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!apiKey) {
      console.error("Missing STRIPE_SECRET_KEY secret");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(apiKey, { apiVersion: "2023-10-16" });

    // Get authenticated user from JWT
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
        console.log("Authenticated user:", userId, userEmail);
      }
    }

    const {
      lookupKey,
      mode = "subscription",
      successUrl,
      cancelUrl,
      allowPromotionCodes = true,
      trialDays,
    } = await req.json();

    console.log("Stripe checkout request:", { lookupKey, mode, successUrl, cancelUrl });

    if (!lookupKey) {
      console.error("Missing lookupKey in request");
      return new Response(JSON.stringify({ error: "Missing lookupKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Searching for price with lookup key: ${lookupKey}`);

    // Resolve active price by lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      expand: ["data.product"],
      limit: 1,
    });

    console.log(`Stripe API response for lookup key ${lookupKey}:`, {
      found: prices.data.length,
      priceIds: prices.data.map((p: any) => p.id),
      productNames: prices.data.map((p: any) => (p.product as any)?.name),
    });

    if (!prices.data.length) {
      console.error(`No active price found for lookup key: ${lookupKey}. Check Stripe Dashboard.`);
      return new Response(JSON.stringify({ 
        error: `No active price found for lookup key: ${lookupKey}. Please verify the price is active and has the correct lookup key in Stripe Dashboard.`
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = prices.data[0].id;
    const product = prices.data[0].product as any;

    console.log(`Creating checkout session for price ${priceId} (${product?.name})`);

    // Create Checkout Session with user metadata
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode === "payment" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${req.headers.get("origin") ?? "https://"}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${req.headers.get("origin") ?? "https://"}/dashboard`,
      allow_promotion_codes: allowPromotionCodes === true,
      metadata: {
        user_id: userId || "",
        lookup_key: lookupKey,
      },
      ...(userEmail ? { customer_email: userEmail } : {}),
      ...(mode === "subscription" && typeof trialDays === "number"
        ? { subscription_data: { trial_period_days: trialDays } }
        : {}),
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return new Response(JSON.stringify({ error: "Checkout error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});