import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const { sessionId } = await req.json();
    
    if (!sessionId || typeof sessionId !== "string") {
      console.log("Missing or invalid sessionId");
      return json({ error: "sessionId is required" }, 400);
    }

    console.log("Verifying checkout session:", sessionId);

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session status:", session.status, "Payment status:", session.payment_status);

    // Determine paid state
    const paid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      session.status === "complete";

    // Fetch line items (expand price + product)
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ["data.price.product"],
    });

    console.log("Found", lineItems.data.length, "line items");

    const items = lineItems.data
      .map((li: any) => {
        const price = li.price;
        const product: any = price?.product;

        // lookup_key exists on Price
        const lookupKey = price?.lookup_key || null;

        // best-effort name: product name first, fallback to description
        const name =
          (product && typeof product === "object" && product.name) ||
          li.description ||
          "Purchase";

        const type = price?.type || null; // "one_time" | "recurring"
        const interval = price?.recurring?.interval || null;

        console.log("Line item:", { lookupKey, name, type, interval });

        return { lookupKey, name, type, interval };
      })
      .filter((item: any) => item.lookupKey); // Only include items with lookup keys

    return json({
      paid,
      items,
      customerEmail: session.customer_details?.email || session.customer_email || null,
    });
  } catch (err: any) {
    console.error("Error verifying checkout:", err);
    return json(
      {
        error: "Failed to verify checkout session",
        message: err?.message || String(err),
      },
      500
    );
  }
});
