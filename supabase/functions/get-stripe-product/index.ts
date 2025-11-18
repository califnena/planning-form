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
    const apiKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!apiKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(apiKey, { apiVersion: "2023-10-16" });

    const { lookupKey } = await req.json();

    if (!lookupKey) {
      return new Response(JSON.stringify({ error: "Missing lookupKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch price by lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      expand: ["data.product"],
      limit: 1,
    });

    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const price = prices.data[0];
    const product = price.product as Stripe.Product;

    return new Response(JSON.stringify({
      id: product.id,
      name: product.name,
      description: product.description || "",
      images: product.images || [],
      priceId: price.id,
      amount: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching Stripe product:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch product" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
