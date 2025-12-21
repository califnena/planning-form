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
      console.error("[stripe-validate-prices] No lookup keys provided");
      return new Response(
        JSON.stringify({ error: "lookupKeys array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("[stripe-validate-prices] STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    console.log(`[stripe-validate-prices] Validating ${lookupKeys.length} lookup keys:`, lookupKeys);

    // Fetch ALL prices (including inactive) to detect inactive ones
    const allPrices = await stripe.prices.list({
      lookup_keys: lookupKeys,
      expand: ["data.product"],
      limit: 100,
    });

    console.log(`[stripe-validate-prices] Found ${allPrices.data.length} prices from Stripe`);

    // Track which lookup keys we found
    const foundLookupKeys = new Set<string>();
    const lookupKeyPrices: Record<string, Stripe.Price[]> = {};

    for (const price of allPrices.data) {
      if (price.lookup_key) {
        foundLookupKeys.add(price.lookup_key);
        if (!lookupKeyPrices[price.lookup_key]) {
          lookupKeyPrices[price.lookup_key] = [];
        }
        lookupKeyPrices[price.lookup_key].push(price);
      }
    }

    // Build result
    const found: {
      lookupKey: string;
      priceId: string;
      active: boolean;
      productName: string | null;
      productActive: boolean;
      unitAmount: number | null;
      currency: string;
      interval: string | null;
    }[] = [];

    const missing: string[] = [];
    const inactive: string[] = [];
    const duplicates: { lookupKey: string; count: number }[] = [];

    for (const key of lookupKeys) {
      if (!foundLookupKeys.has(key)) {
        missing.push(key);
        console.log(`[stripe-validate-prices] MISSING: ${key}`);
      } else {
        const prices = lookupKeyPrices[key];
        
        // Check for duplicates
        if (prices.length > 1) {
          duplicates.push({ lookupKey: key, count: prices.length });
          console.log(`[stripe-validate-prices] DUPLICATE: ${key} has ${prices.length} prices`);
        }

        // Get the most recent active price, or the most recent if none active
        const sortedPrices = prices.sort((a, b) => b.created - a.created);
        const activePrice = sortedPrices.find(p => p.active) || sortedPrices[0];
        
        const product = typeof activePrice.product === "object" 
          ? (activePrice.product as Stripe.Product) 
          : null;
        
        const priceActive = activePrice.active;
        const productActive = product?.active ?? true;
        
        if (!priceActive || !productActive) {
          inactive.push(key);
          console.log(`[stripe-validate-prices] INACTIVE: ${key} (price.active=${priceActive}, product.active=${productActive})`);
        }

        found.push({
          lookupKey: key,
          priceId: activePrice.id,
          active: priceActive && productActive,
          productName: product?.name ?? null,
          productActive,
          unitAmount: activePrice.unit_amount,
          currency: activePrice.currency,
          interval: activePrice.recurring?.interval ?? null,
        });
      }
    }

    const result = {
      found,
      missing,
      inactive,
      duplicates,
      timestamp: new Date().toISOString(),
    };

    console.log(`[stripe-validate-prices] Validation complete:`, {
      foundCount: found.length,
      missingCount: missing.length,
      inactiveCount: inactive.length,
      duplicateCount: duplicates.length,
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[stripe-validate-prices] Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to validate Stripe prices" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
