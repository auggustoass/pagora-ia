
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Received webhook from Mercado Pago");
    const body = await req.text();
    console.log("Request body:", body);
    
    // Parse the webhook payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      console.error("Failed to parse webhook payload:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Parsed payload:", payload);
    
    // Check if this is a test webhook
    if (payload.type === "test") {
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // We're only interested in preapproval (subscription) events
    if (payload.type !== "preapproval") {
      console.log(`Ignoring webhook of type: ${payload.type}`);
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get the preapproval details from Mercado Pago API
    const preapprovalId = payload.data?.id;
    if (!preapprovalId) {
      console.error("Missing preapproval ID in webhook");
      return new Response(
        JSON.stringify({ error: "Missing preapproval ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Fetching preapproval details for ID: ${preapprovalId}`);
    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
      },
    });

    if (!mpResponse.ok) {
      console.error(`Mercado Pago API error: ${mpResponse.status}`);
      const errorText = await mpResponse.text();
      console.error(`Error response: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription with Mercado Pago" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const mpData = await mpResponse.json();
    console.log("Preapproval data:", mpData);

    // Map Mercado Pago status to our internal status
    let subscriptionStatus;
    let paymentStatus;
    
    switch (mpData.status) {
      case "authorized":
        subscriptionStatus = "active";
        paymentStatus = "paid";
        break;
      case "paused":
        subscriptionStatus = "paused";
        paymentStatus = "pending";
        break;
      case "cancelled":
        subscriptionStatus = "canceled";
        paymentStatus = "canceled";
        break;
      case "pending":
        subscriptionStatus = "trial"; // Keep as trial if still pending during trial period
        paymentStatus = "pending";
        break;
      default:
        subscriptionStatus = "expired";
        paymentStatus = "failed";
    }

    // Update the subscription in our database
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        status: subscriptionStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("mercado_pago_subscription_id", preapprovalId)
      .select("*, plans(*)")
      .single();

    if (subscriptionError) {
      console.error("Error updating subscription:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!subscription) {
      console.error("Subscription not found for preapproval ID:", preapprovalId);
      return new Response(
        JSON.stringify({ error: "Subscription not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // If this is a successful payment, record it
    if (paymentStatus === "paid") {
      await supabase
        .from("subscription_payments")
        .insert({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          plan_id: subscription.plan_id,
          amount: subscription.plans.price,
          status: "approved",
          payment_id: mpData.last_payment?.id?.toString() || null,
          payment_date: new Date().toISOString()
        });
      
      console.log("Payment record created successfully");
    }

    console.log("Subscription updated successfully:", subscription);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
