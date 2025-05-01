
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Handle subscription payments (preapproval)
    if (payload.type === "preapproval") {
      return await handleSubscriptionPayment(payload);
    }
    
    // Handle one-time payments (invoices/faturas)
    if (payload.type === "payment") {
      return await handleInvoicePayment(payload);
    }

    // Fallback for unhandled webhook types
    console.log(`Ignoring webhook of type: ${payload.type}`);
    return new Response(
      JSON.stringify({ received: true }),
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

async function handleSubscriptionPayment(payload) {
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
  
  // First get credentials from admin settings
  const { data: adminCredentials, error: adminCredentialsError } = await supabase
    .from("admin_mercado_pago_credentials")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (adminCredentialsError || !adminCredentials) {
    console.error("No admin credentials found for API validation:", adminCredentialsError);
    return new Response(
      JSON.stringify({ error: "Failed to validate with Mercado Pago: Missing credentials" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: {
      "Authorization": `Bearer ${adminCredentials.access_token}`,
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
}

async function handleInvoicePayment(payload) {
  // Get the payment ID
  const paymentId = payload.data?.id;
  if (!paymentId) {
    console.error("Missing payment ID in webhook");
    return new Response(
      JSON.stringify({ error: "Missing payment ID" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Get admin credentials to verify the payment
  const { data: adminCredentials, error: adminCredentialsError } = await supabase
    .from("admin_mercado_pago_credentials")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (adminCredentialsError || !adminCredentials) {
    console.error("No admin credentials found for API validation:", adminCredentialsError);
    return new Response(
      JSON.stringify({ error: "Failed to validate with Mercado Pago: Missing credentials" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Get the payment details from Mercado Pago API
  console.log(`Fetching payment details for ID: ${paymentId}`);
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      "Authorization": `Bearer ${adminCredentials.access_token}`,
    },
  });

  if (!mpResponse.ok) {
    console.error(`Mercado Pago API error: ${mpResponse.status}`);
    const errorText = await mpResponse.text();
    console.error(`Error response: ${errorText}`);
    return new Response(
      JSON.stringify({ error: "Failed to verify payment with Mercado Pago" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  const mpData = await mpResponse.json();
  console.log("Payment data:", mpData);

  // Find the invoice using the external_reference
  const invoiceId = mpData.external_reference;
  if (!invoiceId) {
    console.error("No external_reference found in payment data");
    return new Response(
      JSON.stringify({ error: "No invoice reference found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Get the invoice to verify user_id exists
  const { data: invoice, error: invoiceFetchError } = await supabase
    .from("faturas")
    .select("user_id")
    .eq("id", invoiceId)
    .single();
    
  if (invoiceFetchError || !invoice) {
    console.error("Invoice not found:", invoiceFetchError);
    return new Response(
      JSON.stringify({ error: "Invoice not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  }
  
  if (!invoice.user_id) {
    console.error("Invoice has no associated user_id");
    return new Response(
      JSON.stringify({ error: "Invoice has no associated user" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Map Mercado Pago status to our internal status
  let paymentStatus;
  switch (mpData.status) {
    case "approved":
      paymentStatus = "approved";
      break;
    case "pending":
      paymentStatus = "pending";
      break;
    case "in_process":
      paymentStatus = "pending";
      break;
    case "rejected":
      paymentStatus = "rejected";
      break;
    case "refunded":
      paymentStatus = "refunded";
      break;
    case "cancelled":
      paymentStatus = "cancelled";
      break;
    default:
      paymentStatus = "pending";
  }

  // Update the invoice with payment information
  const { data: updatedInvoice, error: invoiceError } = await supabase
    .from("faturas")
    .update({
      payment_status: paymentStatus,
      status: paymentStatus === "approved" ? "aprovado" : (paymentStatus === "rejected" || paymentStatus === "cancelled" ? "rejeitado" : "pendente"),
      payment_date: new Date().toISOString(),
      paid_amount: mpData.transaction_amount || null
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (invoiceError) {
    console.error("Error updating invoice:", invoiceError);
    return new Response(
      JSON.stringify({ error: "Failed to update invoice" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  console.log("Invoice updated successfully:", updatedInvoice);
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
