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

    const {
      lookupKey, // Direct lookup key like "EFABASIC"
      mode = "subscription", // "subscription" | "payment"
      successUrl,
      cancelUrl,
      allowPromotionCodes = true,
      trialDays,
    } = await req.json();

    if (!lookupKey) {
      return new Response(JSON.stringify({ error: "Missing lookupKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve active price by lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      expand: ["data.product"],
      limit: 1,
    });

    if (!prices.data.length) {
      console.error("No active price found for lookup key:", lookupKey);
      return new Response(JSON.stringify({ 
        error: "We're having trouble loading this price. Please try again later or contact support." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = prices.data[0].id;

    // 2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: mode === "payment" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${req.headers.get("origin") ?? "https://"}/subscription?status=success`,
      cancel_url: cancelUrl ?? `${req.headers.get("origin") ?? "https://"}/subscription?status=cancel`,
      allow_promotion_codes: allowPromotionCodes === true,
      ...(mode === "subscription" && typeof trialDays === "number"
        ? { subscription_data: { trial_period_days: trialDays } }
        : {}),
    });

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