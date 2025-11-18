import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0";

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
    if (!apiKey) {
      console.error("Missing STRIPE_SECRET_KEY secret");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(apiKey, { apiVersion: "2023-10-16" });

    const { packageType, userId } = await req.json();

    if (!packageType || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use lookup key based on package type
    const lookupKey = packageType === 'standard' 
      ? 'STRIPE_STANDARD_SONG_PRICE_ID' 
      : 'STRIPE_PREMIUM_SONG_PRICE_ID';
    
    // Resolve active price by lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      expand: ["data.product"],
      limit: 1,
    });

    if (!prices.data.length) {
      console.error(`No active price found for lookup key: ${lookupKey}`);
      return new Response(JSON.stringify({ 
        error: "We're having trouble loading this price. Please try again later or contact support." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = prices.data[0].id;

    const origin = req.headers.get("origin") || "https://";

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/song-info?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/custom-song`,
      metadata: {
        user_id: userId,
        product_type: packageType,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe song checkout error:", err);
    return new Response(JSON.stringify({ error: "Checkout error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
