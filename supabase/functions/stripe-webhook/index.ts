import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Stripe lookup key to roles mapping (mirrors src/lib/stripeRoleMapping.ts)
const STRIPE_TO_ROLES_MAP: Record<string, string[]> = {
  'EFABASIC': ['basic', 'printable'],
  'EFAPREMIUM': ['basic', 'vip', 'printable'],
  'EFAPREMIUMYEAR': ['basic', 'vip', 'printable'],
  'EFAVIPYEAR': ['vip', 'printable'],
  'EFAVIPMONTHLY': ['vip', 'printable'],
  'EFADOFORU': ['done_for_you', 'basic', 'printable'],
  'EFABINDER': ['binder'],
  'STRIPE_STANDARD_SONG_PRICE_ID': ['song_standard'],
  'STRIPE_PREMIUM_SONG_PRICE_ID': ['song_premium'],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body);
      console.log("WARNING: Processing webhook without signature verification");
    }

    console.log(`Processing Stripe event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);

      // Get user_id from metadata or customer email
      let userId = session.metadata?.user_id;

      if (!userId && session.customer_email) {
        // Look up user by email
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", (await supabase.auth.admin.listUsers()).data.users.find(
            (u: any) => u.email === session.customer_email
          )?.id)
          .maybeSingle();

        // Alternative: query auth.users through profiles join
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.users.find((u: any) => u.email === session.customer_email);
        if (authUser) {
          userId = authUser.id;
        }
      }

      if (!userId) {
        console.error("Could not determine user_id for session:", session.id);
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Processing payment for user:", userId);

      // Retrieve line items to get the price lookup keys
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price"],
      });

      const rolesToGrant: Set<string> = new Set();

      for (const item of lineItems.data) {
        const price = item.price as Stripe.Price;
        const lookupKey = price.lookup_key;

        console.log(`Processing line item: price=${price.id}, lookup_key=${lookupKey}`);

        if (lookupKey && STRIPE_TO_ROLES_MAP[lookupKey]) {
          const roles = STRIPE_TO_ROLES_MAP[lookupKey];
          roles.forEach((role) => rolesToGrant.add(role));
          console.log(`Lookup key ${lookupKey} grants roles:`, roles);
        } else {
          console.log(`No role mapping found for lookup_key: ${lookupKey}`);
        }
      }

      // Grant roles to user
      for (const roleName of rolesToGrant) {
        // Get role_id from app_roles
        const { data: roleData, error: roleError } = await supabase
          .from("app_roles")
          .select("id")
          .eq("name", roleName)
          .single();

        if (roleError || !roleData) {
          console.error(`Role not found: ${roleName}`, roleError);
          continue;
        }

        // Upsert into user_roles (idempotent)
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert(
            { user_id: userId, role_id: roleData.id },
            { onConflict: "user_id,role_id", ignoreDuplicates: true }
          );

        if (upsertError) {
          console.error(`Failed to grant role ${roleName} to user ${userId}:`, upsertError);
        } else {
          console.log(`Granted role ${roleName} to user ${userId}`);
        }
      }

      // Also update purchases table for tracking (existing behavior)
      if (session.metadata?.lookup_key) {
        const { error: purchaseError } = await supabase
          .from("purchases")
          .upsert({
            user_id: userId,
            product_lookup_key: session.metadata.lookup_key,
            status: "completed",
            amount: session.amount_total || 0,
            stripe_payment_intent_id: session.payment_intent as string,
          }, { onConflict: "user_id,product_lookup_key" });

        if (purchaseError) {
          console.error("Failed to record purchase:", purchaseError);
        }
      }

      // Update subscriptions table if this was a subscription
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        const planType = determinePlanType(subscription);
        
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: "active",
            plan_type: planType,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("Failed to update subscription:", subError);
        }
      }

      console.log("Successfully processed checkout session:", session.id);
    }

    // Handle invoice.paid for recurring subscription payments
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = invoice.customer as string;

        // Find user by stripe_customer_id
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (subData?.user_id) {
          // Refresh roles based on subscription
          console.log("Refreshing roles for recurring payment, user:", subData.user_id);
          
          // Get price lookup key from subscription items
          for (const item of subscription.items.data) {
            const lookupKey = item.price.lookup_key;
            if (lookupKey && STRIPE_TO_ROLES_MAP[lookupKey]) {
              const roles = STRIPE_TO_ROLES_MAP[lookupKey];
              for (const roleName of roles) {
                const { data: roleData } = await supabase
                  .from("app_roles")
                  .select("id")
                  .eq("name", roleName)
                  .single();

                if (roleData) {
                  await supabase
                    .from("user_roles")
                    .upsert(
                      { user_id: subData.user_id, role_id: roleData.id },
                      { onConflict: "user_id,role_id", ignoreDuplicates: true }
                    );
                }
              }
            }
          }

          // Update subscription period
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", subData.user_id);
        }
      }
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (subData?.user_id) {
        console.log("Subscription cancelled for user:", subData.user_id);

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", subData.user_id);

        // Optionally remove subscription-based roles
        // Note: We keep one-time purchase roles (like song_standard, binder)
        const subscriptionRoles = ['vip', 'basic', 'printable'];
        for (const roleName of subscriptionRoles) {
          const { data: roleData } = await supabase
            .from("app_roles")
            .select("id")
            .eq("name", roleName)
            .single();

          if (roleData) {
            await supabase
              .from("user_roles")
              .delete()
              .eq("user_id", subData.user_id)
              .eq("role_id", roleData.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function determinePlanType(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  if (!item) return "free";

  const lookupKey = item.price.lookup_key;
  
  if (lookupKey === "EFAVIPYEAR") return "vip_annual";
  if (lookupKey === "EFAVIPMONTHLY") return "vip_monthly";
  if (lookupKey === "EFAPREMIUMYEAR" || lookupKey === "EFAPREMIUM") return "premium";
  if (lookupKey === "EFABASIC") return "basic";
  
  return "free";
}
