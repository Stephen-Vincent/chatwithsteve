import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stripe price IDs (fallback defaults, can be overridden with secrets)
const LIVE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID_LIVE") || "price_1T9YkXEO2NpCqGU6bv7nXyce";
const TEST_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID_TEST") || "price_1T9mjBAwiLWPDXtldb46EMp5";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { quantity, name, email, sessions, message } = await req.json();

    if (!quantity || quantity < 1) throw new Error("Invalid quantity");
    if (!email) throw new Error("Email is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const isTestMode = stripeKey.startsWith("sk_test_");
    const priceId = isTestMode ? TEST_PRICE_ID : LIVE_PRICE_ID;

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://chatwithsteve.co.uk";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&sessions=${encodeURIComponent(JSON.stringify(sessions))}`,
      cancel_url: `${origin}/book`,
      metadata: {
        customer_name: name,
        message: message || "",
        sessions: JSON.stringify(sessions),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
