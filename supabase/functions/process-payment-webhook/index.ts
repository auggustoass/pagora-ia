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

    // Handle one-time payments for credit purchases
    if (payload.type === "payment") {
      return await handleCreditPayment(payload);
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

async function handleCreditPayment(payload) {
  // Get the payment ID
  const paymentId = payload.data?.id;
  if (!paymentId) {
    console.error("Missing payment ID in webhook");
    return new Response(
      JSON.stringify({ error: "Missing payment ID" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Extract plan ID and user ID from external_reference
  // Support both formats: "plan_purchase_PLAN_ID_user_USER_ID" and "credit-USER_ID-PLAN_ID" 
  const externalRef = payload.data?.external_reference;
  if (!externalRef) {
    // This might be a regular invoice payment, not a plan purchase
    // Try to look up the invoice by the external reference
    try {
      return await handleInvoicePayment(payload, externalRef || paymentId.toString());
    } catch (error) {
      console.error("Error handling potential invoice payment:", error);
      return new Response(
        JSON.stringify({ error: "Invalid payment reference" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  }
  
  let userId, planId;
  
  // Handle the new format: "credit-USER_ID-PLAN_ID"
  if (externalRef.startsWith('credit-')) {
    const refParts = externalRef.split('-');
    if (refParts.length >= 3) {
      userId = refParts[1];
      planId = refParts[2];
      console.log(`Found new format reference: userId: ${userId}, planId: ${planId}`);
    }
  } 
  // Handle the old format: "plan_purchase_PLAN_ID_user_USER_ID"
  else if (externalRef.startsWith('plan_purchase_')) {
    const refParts = externalRef.split('_');
    if (refParts.length >= 5) {
      planId = refParts[2];
      userId = refParts[4];
      console.log(`Found old format reference: planId: ${planId}, userId: ${userId}`);
    }
  }

  if (!planId || !userId) {
    console.error("Could not extract plan or user ID from external_reference:", externalRef);
    return new Response(
      JSON.stringify({ error: "Invalid payment reference data" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Get user's Mercado Pago credentials for verification
  const { data: userCredentials, error: credentialsError } = await supabase
    .from("mercado_pago_credentials")
    .select("access_token")
    .eq("user_id", userId)
    .maybeSingle();
  
  // If user has no credentials, try to use admin credentials
  let accessToken = null;
  if (credentialsError || !userCredentials?.access_token) {
    console.log("User has no MP credentials, trying admin credentials");
    
    const { data: adminCredentials, error: adminError } = await supabase
      .from("admin_mercado_pago_credentials")
      .select("access_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (adminError || !adminCredentials?.access_token) {
      console.error("Error fetching admin credentials:", adminError || "No admin credentials found");
      return new Response(
        JSON.stringify({ error: "Failed to validate with Mercado Pago: No credentials available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    accessToken = adminCredentials.access_token;
  } else {
    accessToken = userCredentials.access_token;
  }

  // Get the payment details from Mercado Pago API
  console.log(`Fetching payment details for ID: ${paymentId} using credentials`);
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
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

  // Get plan details to know how many credits to add
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("name")
    .eq("id", planId)
    .single();

  if (planError || !plan) {
    console.error("Error fetching plan:", planError);
    return new Response(
      JSON.stringify({ error: "Plan not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Determine credits based on plan name
  const credits = {
    Basic: 45,      // 5 invoices × 9 credits = 45 credits
    Pro: 90,        // 15 invoices × 6 credits = 90 credits
    Enterprise: 150  // 30 invoices × 5 credits = 150 credits
  };

  const planCredits = credits[plan.name] || 0;
  if (planCredits === 0) {
    console.error("Invalid plan name or no credits defined for plan:", plan.name);
    return new Response(
      JSON.stringify({ error: "Invalid plan configuration" }),
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

  // Update or create a payment record in subscription_payments
  try {
    const { error: paymentError } = await supabase
      .from("subscription_payments")
      .insert({
        user_id: userId,
        plan_id: planId,
        status: paymentStatus,
        payment_id: paymentId.toString(),
        amount: mpData.transaction_amount || 0,
        payment_date: new Date().toISOString()
      })
      .select();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Continue anyway, we might still need to add credits
    }
  } catch (error) {
    console.error("Error in payment record upsert:", error);
    // Continue anyway
  }

  // If payment is approved, add the credits
  if (paymentStatus === "approved") {
    // Check if user already has credits
    const { data: existingCredits, error: existingCreditsError } = await supabase
      .from("user_invoice_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (existingCreditsError && existingCreditsError.code !== 'PGRST116') {
      console.error("Error checking existing credits:", existingCreditsError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing credits" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (existingCredits) {
      // Update existing credits entry
      console.log("Updating existing credits for user:", userId);
      const newCredits = existingCredits.credits_remaining + planCredits;
      
      const { error: updateError } = await supabase
        .from("user_invoice_credits")
        .update({
          credits_remaining: newCredits,
          plan_id: planId,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingCredits.id);
        
      if (updateError) {
        console.error("Error updating credits:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update credits" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log(`Added ${planCredits} credits to user ${userId}, new total: ${newCredits}`);
    } else {
      // Create new credits entry
      console.log("Creating new credits entry for user:", userId);
      const { error: insertError } = await supabase
        .from("user_invoice_credits")
        .insert({
          user_id: userId,
          credits_remaining: planCredits,
          plan_id: planId
        });
        
      if (insertError) {
        console.error("Error inserting credits:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create credits" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log(`Added ${planCredits} new credits for user ${userId}`);
    }
  } else {
    console.log(`Payment status is ${paymentStatus}, not adding credits yet`);
  }

  console.log("Payment webhook processed successfully");
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}

async function handleInvoicePayment(payload, referenceId) {
  const paymentId = payload.data?.id;
  if (!paymentId) {
    throw new Error("Missing payment ID");
  }

  // Try to find the invoice using the reference ID
  const { data: invoice, error: invoiceError } = await supabase
    .from("faturas")
    .select("*, user_id")
    .eq("id", referenceId)
    .maybeSingle();

  if (invoiceError || !invoice) {
    console.error("Error finding invoice:", invoiceError);
    throw new Error("Invoice not found");
  }

  // Get the user's credentials to verify the payment
  const { data: userCredentials, error: credentialsError } = await supabase
    .from("mercado_pago_credentials")
    .select("access_token")
    .eq("user_id", invoice.user_id)
    .maybeSingle();

  if (credentialsError || !userCredentials?.access_token) {
    console.error("User has no Mercado Pago credentials:", credentialsError);
    throw new Error("User has no Mercado Pago credentials");
  }

  // Verify payment with Mercado Pago using user's credentials
  console.log(`Verifying invoice payment for ID: ${paymentId} using user's credentials`);
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      "Authorization": `Bearer ${userCredentials.access_token}`,
    },
  });

  if (!mpResponse.ok) {
    console.error(`Mercado Pago API error: ${mpResponse.status}`);
    throw new Error("Failed to verify payment with Mercado Pago");
  }

  const mpData = await mpResponse.json();
  
  // Map payment status
  let paymentStatus;
  switch (mpData.status) {
    case "approved":
      paymentStatus = "approved";
      break;
    case "pending":
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
  const { error: updateError } = await supabase
    .from("faturas")
    .update({
      payment_status: paymentStatus,
      payment_date: new Date().toISOString(),
      paid_amount: mpData.transaction_amount || invoice.valor
    })
    .eq("id", invoice.id);

  if (updateError) {
    console.error("Error updating invoice payment status:", updateError);
    throw new Error("Failed to update invoice payment status");
  }

  console.log(`Updated invoice ${invoice.id} payment status to ${paymentStatus}`);
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
