import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Updated token validation with more flexible requirements
function validateTokenFormat(token: string): { isValid: boolean; message?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, message: 'Access token é obrigatório' };
  }

  if (!token.startsWith('APP_USR-')) {
    return { isValid: false, message: 'Access token deve começar com APP_USR-' };
  }

  // Updated minimum length to be more realistic
  if (token.length < 60) {
    return { isValid: false, message: 'Access token parece estar incompleto (deve ter pelo menos 60 caracteres)' };
  }

  return { isValid: true };
}

serve(async (req) => {
  console.log("🚀 Function generate-invoice-payment called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("📥 Parsing request body");
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      console.error("❌ Missing invoice ID");
      return new Response(
        JSON.stringify({ error: "Missing invoice ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔍 Fetching invoice ${invoiceId}`);
    
    // Get the invoice details with user_id
    const { data: invoice, error: invoiceError } = await supabase
      .from("faturas")
      .select("*, user_id")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("❌ Invoice not found:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`✅ Invoice found for user ${invoice.user_id}`);

    // Check if the invoice has a user_id
    if (!invoice.user_id) {
      console.error("❌ Invoice has no associated user_id");
      return new Response(
        JSON.stringify({ error: "Invoice has no associated user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔑 Checking Mercado Pago credentials for user ${invoice.user_id}`);
    
    // Check if the user has their own Mercado Pago credentials
    const { data: userCredentials, error: userCredentialsError } = await supabase
      .from("mercado_pago_credentials")
      .select("*")
      .eq("user_id", invoice.user_id)
      .single();

    let accessToken: string;
    let credentialsSource: string;

    if (userCredentialsError || !userCredentials) {
      console.log("👤 No user credentials found, checking for global credentials");
      
      // Check for global admin credentials
      const { data: globalCredentials, error: globalCredentialsError } = await supabase
        .from("admin_mercado_pago_credentials")
        .select("*")
        .limit(1)
        .single();

      if (globalCredentialsError || !globalCredentials) {
        console.error("❌ No Mercado Pago credentials found (user or global)");
        return new Response(
          JSON.stringify({ 
            error: "Mercado Pago credentials not found", 
            details: "Neither user nor global Mercado Pago credentials are configured" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      accessToken = globalCredentials.access_token;
      credentialsSource = "global";
      console.log("🌐 Using global admin credentials");
    } else {
      accessToken = userCredentials.access_token;
      credentialsSource = "user";
      console.log("👤 Using user's personal credentials");
    }
    
    console.log(`🔍 Validating access token (length: ${accessToken.length})`);
    
    // Validate the access token format with updated validation
    const tokenValidation = validateTokenFormat(accessToken);
    if (!tokenValidation.isValid) {
      console.error("❌ Invalid token format:", tokenValidation.message);
      return new Response(
        JSON.stringify({ 
          error: "Invalid Mercado Pago credentials format", 
          details: tokenValidation.message,
          credentialsSource 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
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

    console.log(`💳 Creating payment preference for invoice ${invoice.id} using ${credentialsSource} credentials`);
    console.log("🔗 Preference data:", JSON.stringify(preference, null, 2));
    
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const responseText = await mpResponse.text();
    console.log(`📊 Mercado Pago API response status: ${mpResponse.status}`);
    console.log(`📄 Mercado Pago API response: ${responseText}`);

    if (!mpResponse.ok) {
      console.error("❌ Mercado Pago API error:", responseText);
      
      let errorDetails = responseText;
      
      // Try to parse error response for better error messages
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorDetails = errorData.message;
        } else if (errorData.error) {
          errorDetails = errorData.error;
        }
      } catch (e) {
        // Keep original response text if parsing fails
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create payment preference", 
          details: errorDetails,
          status: mpResponse.status,
          credentialsSource 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const preferenceData = JSON.parse(responseText);
    console.log(`✅ Payment preference created successfully, ID: ${preferenceData.id}`);

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
      console.error("⚠️ Error updating invoice with preference data:", updateError);
      // Continue anyway since we already created the preference
    } else {
      console.log("✅ Invoice updated with payment data");
    }

    const result = {
      success: true,
      preference_id: preferenceData.id,
      payment_url: preferenceData.init_point,
      init_point: preferenceData.init_point,
      sandbox_init_point: preferenceData.sandbox_init_point,
      credentialsSource,
      message: `Payment link generated successfully using ${credentialsSource} credentials`
    };

    console.log("🎉 Function completed successfully:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("💥 Unexpected error in generate-invoice-payment:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
