
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

    // Create the subscription in Mercado Pago
    console.log("Preparing Mercado Pago request");
    const backUrl = `${req.headers.get("origin") || "http://localhost:5173"}/planos/obrigado`;
    const notificationUrl = `${supabaseUrl}/functions/v1/process-payment-webhook`;

    const payload = {
      reason: `Assinatura ${plan.name} - HBLACKPIX`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price,
        currency_id: "BRL",
      },
      back_url: backUrl,
      notification_url: notificationUrl,
      payer_email: user.email,
    };

    console.log("Sending request to Mercado Pago API");
    // Call Mercado Pago API to create a subscription
    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
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
      let errorMessage = "Falha ao criar assinatura no Mercado Pago";
      
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

    console.log("Subscription created in Mercado Pago:", mpData.id);
    
    // Check for existing subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .in("status", ["trial", "active"])
      .maybeSingle();
      
    if (existingSubscription) {
      // Update existing subscription
      console.log("Updating existing subscription:", existingSubscription.id);
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          mercado_pago_subscription_id: mpData.id,
          payment_status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSubscription.id);
        
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update subscription record" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log("Existing subscription updated successfully");
    } else {
      // Calculate trial end date (30 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      
      // Create new subscription
      console.log("Creating new subscription");
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "trial",
          trial_ends_at: trialEndsAt.toISOString(),
          mercado_pago_subscription_id: mpData.id,
          payment_status: "pending"
        });

      if (subscriptionError) {
        console.error("Database error:", subscriptionError);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription record" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log("New subscription created successfully");
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
