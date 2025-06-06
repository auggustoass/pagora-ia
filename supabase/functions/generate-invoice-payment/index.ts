
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function validateTokenFormat(token: string): { isValid: boolean; message?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, message: 'Access token é obrigatório' };
  }

  if (!token.startsWith('APP_USR-')) {
    return { isValid: false, message: 'Access token deve começar com APP_USR-' };
  }

  if (token.length < 60) {
    return { isValid: false, message: 'Access token parece estar incompleto (deve ter pelo menos 60 caracteres)' };
  }

  return { isValid: true };
}

async function generatePaymentLink(invoice: any, accessToken: string, credentialsSource: string, req: Request) {
  console.log(`💳 Creating payment preference for invoice ${invoice.id}`);
  
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
    payment_methods: {
      excluded_payment_types: [],
      excluded_payment_methods: [],
      installments: 1,
      default_installments: 1
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

  console.log("🔗 Preference data:", JSON.stringify(preference, null, 2));
  
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preference)
  });

  const responseText = await response.text();
  console.log(`📊 Mercado Pago Preference API response status: ${response.status}`);
  console.log(`📄 Mercado Pago Preference API response: ${responseText}`);

  if (!response.ok) {
    console.error("❌ Mercado Pago Preference API error:", responseText);
    throw new Error(`Erro ao criar link de pagamento: ${responseText}`);
  }

  const preferenceData = JSON.parse(responseText);
  console.log(`✅ Payment preference created successfully, ID: ${preferenceData.id}`);

  return {
    preference_id: preferenceData.id,
    payment_url: preferenceData.init_point,
    init_point: preferenceData.init_point,
    sandbox_init_point: preferenceData.sandbox_init_point,
    credentialsSource
  };
}

serve(async (req) => {
  console.log("🚀 Function generate-invoice-payment called");
  
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("📥 Parsing request body");
    const { invoiceId, paymentType = "link" } = await req.json();
    
    if (!invoiceId) {
      console.error("❌ Missing invoice ID");
      return new Response(
        JSON.stringify({ error: "Missing invoice ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔍 Fetching invoice ${invoiceId} for payment type: ${paymentType}`);
    
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
    
    // Validate the access token format
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

    // Generate payment link
    const result = await generatePaymentLink(invoice, accessToken, credentialsSource, req);
    
    // Update invoice with preference data
    const updateData: any = {
      mercado_pago_preference_id: result.preference_id,
      payment_url: result.payment_url,
      payment_status: "pending"
    };

    const { error: updateError } = await supabase
      .from("faturas")
      .update(updateData)
      .eq("id", invoice.id);
      
    if (updateError) {
      console.error("⚠️ Error updating invoice with preference data:", updateError);
    } else {
      console.log("✅ Invoice updated with payment data");
    }

    result.success = true;
    result.message = `Link de pagamento gerado com sucesso usando credenciais ${credentialsSource}`;

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
