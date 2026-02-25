import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      collectPhone = true,
    } = await req.json();

    console.log("Stripe checkout request:", { lookupKey, mode, successUrl, cancelUrl });

    if (!lookupKey) {
      console.error("Missing lookupKey in request");
      return new Response(JSON.stringify({ error: "Missing lookupKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log admin notification: Attempt started
    console.log("=== ADMIN NOTIFICATION: PURCHASE ATTEMPT STARTED ===");
    console.log(`Event: Attempt started`);
    console.log(`Product key: ${lookupKey}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`User (if known): ${userId || "anonymous"}`);
    console.log(`Email (if known): ${userEmail || "not yet collected"}`);
    console.log(`Notes: Customer is being sent to Stripe Checkout.`);
    console.log("=== END ADMIN NOTIFICATION ===");

    console.log(`Resolving price for lookup key: ${lookupKey}`);

    let priceId: string | null = null;
    let product: any = null;

    // For EFABINDER, prefer env-based price ID if set
    const envBinderPrice = lookupKey === "EFABINDER" ? Deno.env.get("STRIPE_PRICE_ID_BINDER") : null;

    if (envBinderPrice) {
      console.log(`Using env STRIPE_PRICE_ID_BINDER: ${envBinderPrice}`);
      priceId = envBinderPrice;
      // Optionally fetch product name for logs
      try {
        const p = await stripe.prices.retrieve(envBinderPrice, { expand: ["product"] });
        product = p.product;
      } catch (e) {
        console.warn("Could not expand binder price product:", e);
      }
    } else {
      // Resolve active price by lookup key
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        expand: ["data.product"],
        limit: 1,
      });

      console.log(`Stripe lookup_key search result for ${lookupKey}:`, {
        found: prices.data.length,
        priceIds: prices.data.map((p: any) => p.id),
        productNames: prices.data.map((p: any) => (p.product as any)?.name),
      });

      if (!prices.data.length) {
        console.error(`No active price found for lookup key: ${lookupKey}. Check Stripe Dashboard.`);
        return new Response(JSON.stringify({ 
          error: lookupKey === "EFABINDER"
            ? "Binder price not configured"
            : `No active price found for key: ${lookupKey}`
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      priceId = prices.data[0].id;
      product = prices.data[0].product;
    }

    console.log(`Creating checkout session for price ${priceId} (${product?.name || "unknown"})`);

    // Determine checkout mode: binder is always "payment", others depend on price type
    const isBinder = lookupKey === "EFABINDER";
    let checkoutMode: "payment" | "subscription" = "payment";
    if (!isBinder) {
      // Fetch price to check type
      try {
        const priceObj = await stripe.prices.retrieve(priceId);
        checkoutMode = priceObj.type === "recurring" ? "subscription" : "payment";
      } catch {
        checkoutMode = "payment";
      }
    }

    // Build metadata
    const sessionMetadata: Record<string, string> = {
      user_id: userId || "",
      lookup_key: lookupKey,
      source: "efa_site",
      ...(isBinder ? { product_type: "binder" } : {}),
    };

    // Create Checkout Session with user metadata
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${req.headers.get("origin") ?? "https://"}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${req.headers.get("origin") ?? "https://"}/dashboard`,
      allow_promotion_codes: allowPromotionCodes === true,
      
      // Collect customer contact info
      customer_creation: checkoutMode === "payment" ? "always" : undefined,
      billing_address_collection: "auto",
      
      // Shipping address for physical products (binder)
      ...(isBinder ? {
        shipping_address_collection: {
          allowed_countries: ["US"] as any,
        },
      } : {}),
      
      // Phone collection
      phone_number_collection: collectPhone ? { enabled: true } : undefined,
      
      metadata: sessionMetadata,
      
      // Also attach metadata to payment intent for one-time payments
      ...(checkoutMode === "payment" ? {
        payment_intent_data: {
          metadata: sessionMetadata,
        }
      } : {}),
      
      // Pre-fill customer email if known
      ...(userEmail ? { customer_email: userEmail } : {}),
      
      // Trial period for subscriptions
      ...(checkoutMode === "subscription" && typeof trialDays === "number"
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
    // Best-effort error log with PAYMENT_ERROR action
    try {
      const sbUrl = Deno.env.get("SUPABASE_URL")!;
      const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(sbUrl, sbKey);
      await sb.from("error_logs").insert({
        action: "PAYMENT_ERROR",
        error_message: String(err),
        stack_trace: (err as Error)?.stack || null,
        user_id: null,
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
        severity: "error",
        metadata: {
          checkout_session_id: null,
          payment_intent_id: null,
          lookup_key: lookupKey ?? null,
          stage: "session_creation",
        },
      });
    } catch { /* ignore logging failure */ }
    return new Response(JSON.stringify({ error: "Checkout error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});