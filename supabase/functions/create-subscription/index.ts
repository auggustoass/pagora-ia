
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { planId, userId, token } = await req.json();
    
    // Verify the user making the request
    const authClient = createClient(supabaseUrl, token);
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get user's Mercado Pago credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from("mercado_pago_credentials")
      .select("access_token")
      .eq("user_id", userId)
      .maybeSingle();
    
    // For the demo, we'll use a default access token if user doesn't have one
    // In production, you would require proper credentials
    const accessToken = credentials?.access_token || Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Mercado Pago credentials not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create the subscription in Mercado Pago
    const backUrl = `${req.headers.get("origin")}/planos/obrigado`;
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

    // Call Mercado Pago API to create a subscription
    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription in Mercado Pago" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Calculate trial end date (30 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // Update the subscription in our database
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        mercado_pago_subscription_id: mpData.id,
        payment_status: "pending"
      })
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .select()
      .single();

    if (subscriptionError) {
      console.error("Database error:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription record" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return success with the Mercado Pago init point URL for redirect
    return new Response(
      JSON.stringify({
        success: true,
        subscription: subscription,
        checkout_url: mpData.init_point
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
