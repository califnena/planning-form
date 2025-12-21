import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

/**
 * Stripe lookup key to roles mapping (per spec)
 * 
 * Grant Rules:
 * - EFABASIC → printable (access_basic_printables)
 * - EFAPREMIUM → premium + printable (access_premium_tools + access_basic_printables)
 * - EFABINDER → premium + printable (same as EFAPREMIUM)
 * - STANDARDSONG → song_standard (access_song_request)
 * - EFAVIPMONTHLY/EFAVIPYEAR → vip + premium + printable (access_full_platform)
 * - EFADOFORU → done_for_you + vip + premium + printable (access_full_platform + access_do_it_for_you)
 */
const PLAN_DEFINITIONS: Record<string, { planCode: string; roles: string[] }> = {
  'EFABASIC': { planCode: 'basic', roles: ['printable'] },
  'EFAPREMIUM': { planCode: 'premium', roles: ['premium', 'printable'] },
  'EFAPREMIUMYEAR': { planCode: 'premium', roles: ['premium', 'printable'] },
  'EFAVIPYEAR': { planCode: 'vip_annual', roles: ['vip', 'premium', 'printable'] },
  'EFAVIPMONTHLY': { planCode: 'vip_monthly', roles: ['vip', 'premium', 'printable'] },
  'EFADOFORU': { planCode: 'done_for_you', roles: ['done_for_you', 'vip', 'premium', 'printable'] },
  'EFABINDER': { planCode: 'binder', roles: ['premium', 'printable'] }, // Same as EFAPREMIUM
  'STANDARDSONG': { planCode: 'song_standard', roles: ['song_standard'] },
  'STRIPE_STANDARD_SONG_PRICE_ID': { planCode: 'song_standard', roles: ['song_standard'] },
  'STRIPE_PREMIUM_SONG_PRICE_ID': { planCode: 'song_premium', roles: ['song_premium'] },
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

    // SECURITY: Require webhook signature verification - fail closed
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured - rejecting webhook");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      console.error("Missing stripe-signature header - rejecting webhook");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing Stripe event: ${event.type}`);

    // Handle checkout.session.completed - MAIN SUCCESS EVENT
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(stripe, supabase, event.data.object as Stripe.Checkout.Session);
    }

    // Handle invoice.paid for recurring subscription payments
    if (event.type === "invoice.paid") {
      await handleInvoicePaid(stripe, supabase, event.data.object as Stripe.Invoice);
    }

    // Handle subscription updates
    if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(stripe, supabase, event.data.object as Stripe.Subscription);
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
    }

    // Handle payment failures
    if (event.type === "invoice.payment_failed") {
      await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice);
    }

    // Handle checkout session expired (abandoned)
    if (event.type === "checkout.session.expired") {
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
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

async function handleCheckoutCompleted(stripe: Stripe, supabase: any, session: Stripe.Checkout.Session) {
  console.log("Checkout session completed:", session.id);

  const lookupKey = session.metadata?.lookup_key || "";
  const customerEmail = session.customer_details?.email || session.customer_email || "";
  const customerName = session.customer_details?.name || "";
  const customerId = session.customer as string || "";

  // Log admin notification: Purchase Success
  console.log("=== ADMIN NOTIFICATION: PURCHASE SUCCESS ===");
  console.log(`Event: Payment success`);
  console.log(`Product key: ${lookupKey}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Email: ${customerEmail}`);
  console.log(`Name: ${customerName}`);
  console.log(`Stripe Customer ID: ${customerId}`);
  console.log(`Checkout Session ID: ${session.id}`);
  console.log(`Amount: ${session.amount_total} ${session.currency?.toUpperCase()}`);

  // Get user_id from metadata or customer email
  let userId = session.metadata?.user_id;

  if (!userId && customerEmail) {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find((u: any) => u.email === customerEmail);
    if (authUser) {
      userId = authUser.id;
    }
  }

  if (!userId) {
    console.error("Could not determine user_id for session:", session.id);
    console.log("=== END ADMIN NOTIFICATION (no user found) ===");
    return;
  }

  console.log("Processing payment for user:", userId);

  // Retrieve line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price"],
  });

  const rolesToGrant: Set<string> = new Set();
  let primaryLookupKey = lookupKey;
  let primaryPlanCode = "";

  for (const item of lineItems.data) {
    const price = item.price as Stripe.Price;
    const itemLookupKey = price.lookup_key || "";

    console.log(`Processing line item: price=${price.id}, lookup_key=${itemLookupKey}`);

    if (itemLookupKey && PLAN_DEFINITIONS[itemLookupKey]) {
      const def = PLAN_DEFINITIONS[itemLookupKey];
      def.roles.forEach((role) => rolesToGrant.add(role));
      if (!primaryPlanCode) primaryPlanCode = def.planCode;
      if (!primaryLookupKey) primaryLookupKey = itemLookupKey;
      console.log(`Lookup key ${itemLookupKey} grants roles:`, def.roles);
    }
  }

  // Also check session-level lookup key
  if (lookupKey && PLAN_DEFINITIONS[lookupKey]) {
    const def = PLAN_DEFINITIONS[lookupKey];
    def.roles.forEach((role) => rolesToGrant.add(role));
    if (!primaryPlanCode) primaryPlanCode = def.planCode;
  }

  // Log access granted
  const accessFlags = mapAccessFromRoles(rolesToGrant);
  console.log("Access granted:");
  console.log(`  basic_printables: ${accessFlags.access_basic_printables}`);
  console.log(`  premium_tools: ${accessFlags.access_premium_tools}`);
  console.log(`  song_request: ${accessFlags.access_song_request}`);
  console.log(`  full_platform: ${accessFlags.access_full_platform}`);
  console.log(`  do_it_for_you: ${accessFlags.access_do_it_for_you}`);
  console.log("=== END ADMIN NOTIFICATION ===");

  // Grant roles to user
  await grantRolesToUser(supabase, userId, rolesToGrant);

  // Update subscriptions table if this was a subscription
  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    await upsertSubscription(supabase, {
      userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || null,
      stripeProductId: subscription.items.data[0]?.price.product as string || null,
      planCode: primaryPlanCode || determinePlanType(subscription),
      status: "active",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  // Record one-time purchases
  if (session.mode === "payment" && primaryLookupKey) {
    await supabase
      .from("purchases")
      .upsert({
        user_id: userId,
        product_lookup_key: primaryLookupKey,
        status: "completed",
        amount: session.amount_total || 0,
        stripe_payment_intent_id: session.payment_intent as string,
      }, { onConflict: "user_id,product_lookup_key" });
  }

  console.log("Successfully processed checkout session:", session.id);
}

async function handleInvoicePaid(stripe: Stripe, supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customerId = invoice.customer as string;

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!subData?.user_id) {
    console.log("No user found for customer:", customerId);
    return;
  }

  console.log("Refreshing roles for recurring payment, user:", subData.user_id);

  // Refresh roles based on subscription
  const rolesToGrant: Set<string> = new Set();
  let planCode = "";

  for (const item of subscription.items.data) {
    const lookupKey = item.price.lookup_key;
    if (lookupKey && PLAN_DEFINITIONS[lookupKey]) {
      const def = PLAN_DEFINITIONS[lookupKey];
      def.roles.forEach((role) => rolesToGrant.add(role));
      if (!planCode) planCode = def.planCode;
    }
  }

  await grantRolesToUser(supabase, subData.user_id, rolesToGrant);

  // Update subscription period
  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      plan_type: planCode || determinePlanType(subscription),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", subData.user_id);
}

async function handleSubscriptionUpdated(stripe: Stripe, supabase: any, subscription: Stripe.Subscription) {
  console.log("Subscription updated:", subscription.id);

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (!subData?.user_id) {
    console.log("No user found for subscription:", subscription.id);
    return;
  }

  const planCode = determinePlanType(subscription);

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      plan_type: planCode,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", subData.user_id);
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  console.log("Subscription deleted:", subscription.id);

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (!subData?.user_id) {
    console.log("No user found for subscription:", subscription.id);
    return;
  }

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({ 
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", subData.user_id);

  // Revoke subscription-based roles (keep one-time purchase roles like done_for_you)
  const subscriptionRoles = ['vip', 'premium', 'printable'];
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

  console.log("Revoked subscription roles for user:", subData.user_id);
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  console.log("=== ADMIN NOTIFICATION: PAYMENT FAILED ===");
  console.log(`Event: Payment failed`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Email: ${invoice.customer_email || "unknown"}`);
  console.log(`Stripe Payment Intent: ${invoice.payment_intent}`);
  console.log(`Reason: ${invoice.last_finalization_error?.message || "Unknown"}`);
  console.log(`Next step: User must retry checkout.`);
  console.log("=== END ADMIN NOTIFICATION ===");

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", invoice.subscription)
    .maybeSingle();

  if (subData?.user_id) {
    await supabase
      .from("subscriptions")
      .update({ 
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", subData.user_id);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const lookupKey = session.metadata?.lookup_key || "unknown";
  const email = session.customer_details?.email || session.customer_email || "unknown";

  console.log("=== ADMIN NOTIFICATION: CHECKOUT ABANDONED ===");
  console.log(`Event: Checkout expired`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Product key: ${lookupKey}`);
  console.log(`Session ID: ${session.id}`);
  console.log(`Email: ${email}`);
  console.log(`Notes: No access granted.`);
  console.log("=== END ADMIN NOTIFICATION ===");
}

async function grantRolesToUser(supabase: any, userId: string, roles: Set<string>) {
  for (const roleName of roles) {
    const { data: roleData, error: roleError } = await supabase
      .from("app_roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError || !roleData) {
      console.error(`Role not found: ${roleName}`, roleError);
      continue;
    }

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
}

async function upsertSubscription(supabase: any, data: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  planCode: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) {
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: data.userId,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_price_id: data.stripePriceId,
      stripe_product_id: data.stripeProductId,
      plan_type: data.planCode,
      status: data.status,
      current_period_start: data.currentPeriodStart.toISOString(),
      current_period_end: data.currentPeriodEnd.toISOString(),
      cancel_at_period_end: data.cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Failed to upsert subscription:", error);
  }
}

function determinePlanType(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  if (!item) return "free";

  const lookupKey = item.price.lookup_key;
  
  if (lookupKey && PLAN_DEFINITIONS[lookupKey]) {
    return PLAN_DEFINITIONS[lookupKey].planCode;
  }
  
  return "free";
}

function mapAccessFromRoles(roles: Set<string>): {
  access_basic_printables: boolean;
  access_premium_tools: boolean;
  access_song_request: boolean;
  access_full_platform: boolean;
  access_do_it_for_you: boolean;
} {
  return {
    access_basic_printables: roles.has('printable'),
    access_premium_tools: roles.has('premium') || roles.has('vip') || roles.has('done_for_you'),
    access_song_request: roles.has('song_standard') || roles.has('song_premium'),
    access_full_platform: roles.has('vip') || roles.has('done_for_you'),
    access_do_it_for_you: roles.has('done_for_you'),
  };
}
