import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const defaultMpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

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
    console.log("Processing subscription request");
    let { planId, userId, token } = await req.json();
    
    if (!planId || !userId || !token) {
      console.error("Missing required parameters:", { planId, userId, token: Boolean(token) });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verify the user making the request
    console.log("Verifying user authentication");
    const authClient = createClient(supabaseUrl, token);
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get the plan details
    console.log("Fetching plan details");
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      console.error("Error fetching plan:", planError);
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get user's Mercado Pago credentials
    console.log("Fetching Mercado Pago credentials");
    const { data: credentials, error: credentialsError } = await supabase
      .from("mercado_pago_credentials")
      .select("access_token")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (credentialsError) {
      console.error("Error fetching credentials:", credentialsError);
    }
    
    // Use user's credentials or fall back to default token
    const accessToken = credentials?.access_token || defaultMpToken;
    
    if (!accessToken) {
      console.error("No Mercado Pago credentials available");
      return new Response(
        JSON.stringify({ 
          error: "Credenciais do Mercado Pago não configuradas. Configure suas credenciais em Configurações." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create the payment in Mercado Pago (not a subscription anymore)
    console.log("Preparing Mercado Pago request");
    const backUrl = `${req.headers.get("origin") || "http://localhost:5173"}/planos/obrigado`;
    const notificationUrl = `${supabaseUrl}/functions/v1/process-payment-webhook`;

    // Determine invoice credits based on plan name
    const credits = {
      Basic: 5,      // R$49 = R$9,80 per invoice
      Pro: 15,       // R$97 = R$6,46 per invoice
      Enterprise: 30 // R$197 = R$5,62 per invoice
    };
    
    const planCredits = credits[plan.name as keyof typeof credits] || 0;

    // Create a single payment for the plan
    const payload = {
      items: [
        {
          title: `${planCredits} créditos para faturas - Plano ${plan.name}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: plan.price,
          description: `${planCredits} créditos para geração de faturas - Plano ${plan.name} HBLACKPIX`,
        },
      ],
      back_urls: {
        success: backUrl,
        failure: backUrl,
        pending: backUrl,
      },
      notification_url: notificationUrl,
      external_reference: `plan_purchase_${planId}_user_${userId}`,
      payer: {
        email: user.email,
      },
    };

    console.log("Sending request to Mercado Pago API");
    // Call Mercado Pago API to create a payment preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Mercado Pago API response status:", mpResponse.status);
    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      let errorMessage = "Falha ao criar pagamento no Mercado Pago";
      
      if (mpData.message) {
        errorMessage += `: ${mpData.message}`;
      }
      
      if (mpData.error === "invalid_access_token") {
        errorMessage = "Token de acesso do Mercado Pago inválido. Verifique suas configurações.";
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: mpData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Payment preference created in Mercado Pago:", mpData.id);
    
    // Check if user already has credits
    const { data: existingCredits, error: existingCreditsError } = await supabase
      .from("user_invoice_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (existingCreditsError && existingCreditsError.code !== 'PGRST116') {
      console.error("Error checking existing credits:", existingCreditsError);
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
      } else {
        console.log(`Added ${planCredits} credits to user ${userId}, new total: ${newCredits}`);
      }
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
      } else {
        console.log(`Added ${planCredits} new credits for user ${userId}`);
      }
    }
    
    // Record purchase in subscription_payments table
    try {
      await supabase
        .from("subscription_payments")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "pending",
          amount: plan.price
        });
    } catch (paymentError) {
      console.error("Error recording payment:", paymentError);
      // Continue anyway as this is just for record-keeping
    }

    // Return success with the Mercado Pago init point URL for redirect
    console.log("Returning success response with checkout URL");
    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: mpData.init_point
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Unhandled error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
