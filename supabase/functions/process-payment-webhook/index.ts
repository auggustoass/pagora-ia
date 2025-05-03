
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

  // Get admin credentials to verify the payment
  const { data: adminCredentials, error: adminCredentialsError } = await supabase
    .from("admin_mercado_pago_credentials")
    .select("access_token")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (adminCredentialsError || !adminCredentials?.access_token) {
    console.error("No admin credentials found for API validation:", adminCredentialsError);
    
    // Try to get any user credentials as fallback
    const { data: userCredentials, error: userCredentialsError } = await supabase
      .from("mercado_pago_credentials")
      .select("access_token")
      .limit(1)
      .maybeSingle();
      
    if (userCredentialsError || !userCredentials?.access_token) {
      console.error("No user credentials found for API validation:", userCredentialsError);
      return new Response(
        JSON.stringify({ error: "Failed to validate with Mercado Pago: No credentials available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    adminCredentials = userCredentials;
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

  // Extract plan ID and user ID from external_reference
  // Format: plan_purchase_PLAN_ID_user_USER_ID
  const externalRef = mpData.external_reference;
  if (!externalRef || !externalRef.startsWith('plan_purchase_')) {
    console.error("Invalid external_reference format:", externalRef);
    return new Response(
      JSON.stringify({ error: "Invalid payment reference" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const refParts = externalRef.split('_');
  if (refParts.length < 5) {
    console.error("External reference doesn't contain enough parts:", refParts);
    return new Response(
      JSON.stringify({ error: "Invalid payment reference format" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  const planId = refParts[2];
  const userId = refParts[4];

  console.log(`Found planId: ${planId}, userId: ${userId} in external_reference`);

  if (!planId || !userId) {
    console.error("Could not extract plan or user ID from external_reference");
    return new Response(
      JSON.stringify({ error: "Invalid payment reference data" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

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
    Basic: 5,
    Pro: 15,
    Enterprise: 30
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

  // Update the payment status in our database
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("subscription_payments")
    .update({
      status: paymentStatus,
      payment_id: paymentId.toString(),
      payment_date: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (paymentError) {
    console.error("Error updating payment record:", paymentError);
    // Continue anyway, we might still need to add credits
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
