import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lookupKeys } = await req.json();

    if (!Array.isArray(lookupKeys) || lookupKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "lookupKeys is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    // Stripe supports lookup_keys[] query
    const prices = await stripe.prices.list({
      lookup_keys: lookupKeys,
      active: true,
      expand: ["data.product"],
      limit: 100,
    });

    console.log(`Fetched ${prices.data.length} prices for lookup keys:`, lookupKeys);

    const normalized = prices.data.map((p: Stripe.Price) => ({
      lookupKey: p.lookup_key,
      priceId: p.id,
      currency: p.currency,
      unitAmount: p.unit_amount, // integer in cents
      type: p.type, // one_time or recurring
      interval: p.recurring?.interval ?? null, // month/year if recurring
      intervalCount: p.recurring?.interval_count ?? null,
      productName: typeof p.product === "object" ? (p.product as Stripe.Product).name : null,
      productDescription: typeof p.product === "object" ? (p.product as Stripe.Product).description : null,
    }));

    // Return as a map for easy UI lookup
    const byLookupKey: Record<string, unknown> = {};
    for (const item of normalized) {
      if (item.lookupKey) {
        byLookupKey[item.lookupKey] = item;
      }
    }

    return new Response(
      JSON.stringify({ prices: byLookupKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error fetching Stripe prices:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load Stripe prices" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
