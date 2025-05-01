
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
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      console.error("Missing invoice ID");
      return new Response(
        JSON.stringify({ error: "Missing invoice ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get the invoice details with user_id
    const { data: invoice, error: invoiceError } = await supabase
      .from("faturas")
      .select("*, user_id")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice not found:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if the invoice has a user_id
    if (!invoice.user_id) {
      console.error("Invoice has no associated user_id");
      return new Response(
        JSON.stringify({ error: "Invoice has no associated user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // First check if the user has Mercado Pago credentials
    const { data: userCredentials, error: userCredentialsError } = await supabase
      .from("mercado_pago_credentials")
      .select("*")
      .eq("user_id", invoice.user_id)
      .single();

    // If the user doesn't have credentials, fall back to admin credentials
    let credentials;
    if (userCredentialsError || !userCredentials) {
      console.log(`User ${invoice.user_id} has no Mercado Pago credentials, falling back to admin credentials`);
      
      const { data: adminCredentials, error: adminCredentialsError } = await supabase
        .from("admin_mercado_pago_credentials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (adminCredentialsError || !adminCredentials) {
        console.error("No payment credentials found:", adminCredentialsError);
        return new Response(
          JSON.stringify({ error: "No payment credentials found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      credentials = adminCredentials;
      console.log("Using admin credentials for payment processing");
    } else {
      credentials = userCredentials;
      console.log(`Using user's own credentials for payment processing (User ID: ${invoice.user_id})`);
    }

    // Create a Mercado Pago preference
    const backUrl = `${req.headers.get("origin") || "https://app.lovable.dev"}/faturas`;
    const webhookUrl = `${supabaseUrl}/functions/v1/process-payment-webhook`;
    
    const preference = {
      items: [
        {
          title: `Fatura - ${invoice.descricao}`,
          description: `Fatura para ${invoice.nome}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(invoice.valor),
        }
      ],
      payer: {
        name: invoice.nome,
        email: invoice.email,
      },
      back_urls: {
        success: backUrl,
        failure: backUrl,
        pending: backUrl,
      },
      notification_url: webhookUrl,
      external_reference: invoice.id,
      auto_return: "approved",
    };

    console.log(`Creating payment preference for invoice ${invoice.id}`);
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Mercado Pago API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment preference", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const preferenceData = await mpResponse.json();
    console.log(`Payment preference created successfully, ID: ${preferenceData.id}`);

    // Update the invoice with the preference ID and payment URL
    const { error: updateError } = await supabase
      .from("faturas")
      .update({
        mercado_pago_preference_id: preferenceData.id,
        payment_url: preferenceData.init_point,
        payment_status: "pending"
      })
      .eq("id", invoice.id);
      
    if (updateError) {
      console.error("Error updating invoice with preference data:", updateError);
      // Continue anyway since we already created the preference
    }

    return new Response(
      JSON.stringify({
        success: true,
        preference_id: preferenceData.id,
        payment_url: preferenceData.init_point,
        init_point: preferenceData.init_point,
        sandbox_init_point: preferenceData.sandbox_init_point
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error generating payment:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
