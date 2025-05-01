
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
    // Verify the user is an admin
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check if the user is an admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized, admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Handle different operations
    const { action, access_token, public_key, user_mercado_pago_id } = await req.json();

    switch (action) {
      case "create":
        return await createCredentials(access_token, public_key, user_mercado_pago_id);
      case "test":
        return await testCredentials(access_token);
      case "get":
        return await getCredentials();
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function createCredentials(access_token, public_key, user_mercado_pago_id) {
  if (!access_token || !public_key || !user_mercado_pago_id) {
    return new Response(
      JSON.stringify({ error: "Missing required credentials" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Validate the credentials before storing
  const testResult = await testCredentials(access_token);
  if (testResult.status !== 200) {
    return testResult;
  }

  // Delete existing credentials first
  await supabase
    .from("admin_mercado_pago_credentials")
    .delete()
    .neq("id", "placeholder");  // Delete all

  // Insert new credentials
  const { data, error } = await supabase
    .from("admin_mercado_pago_credentials")
    .insert({
      access_token,
      public_key,
      user_mercado_pago_id
    })
    .select();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to store credentials" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Credentials stored successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}

async function testCredentials(access_token) {
  try {
    // Test the access token by getting user information
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        "Authorization": `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: "Invalid credentials", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userData = await response.json();
    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to test credentials", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function getCredentials() {
  const { data, error } = await supabase
    .from("admin_mercado_pago_credentials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "No credentials found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Don't return the full access token for security
  const masked_access_token = data.access_token.substring(0, 4) + "..." + 
    data.access_token.substring(data.access_token.length - 4);

  return new Response(
    JSON.stringify({
      public_key: data.public_key,
      user_mercado_pago_id: data.user_mercado_pago_id,
      access_token: masked_access_token,
      has_credentials: true
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
