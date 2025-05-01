
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    console.log("Request received by admin-mercado-pago function");
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the user's token for checking admin status
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed", authError);
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: authError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

    // Check if the user is an admin using the service role client with user's ID
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (roleError) {
      console.error("Error fetching user roles:", roleError);
      return new Response(
        JSON.stringify({ error: "Error checking admin status", details: roleError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const isAdmin = userRoles?.some(role => role.role === 'admin');
    
    if (!isAdmin) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Unauthorized, admin access required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log("Admin access confirmed for user:", user.id);

    // Handle different operations with request body
    const requestData = await req.json();
    const { action, access_token, public_key, user_mercado_pago_id } = requestData;

    console.log("Requested action:", action);

    // Create a regular Supabase client for database operations
    // Using the service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case "create":
        return await createCredentials(supabase, access_token, public_key, user_mercado_pago_id);
      case "test":
        return await testCredentials(access_token);
      case "get":
        return await getCredentials(supabase);
      default:
        console.error("Invalid action requested:", action);
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function createCredentials(supabase, access_token, public_key, user_mercado_pago_id) {
  if (!access_token || !public_key || !user_mercado_pago_id) {
    console.error("Missing required credentials");
    return new Response(
      JSON.stringify({ error: "Missing required credentials" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Validate the credentials before storing
  const testResult = await testCredentials(access_token);
  if (testResult.status !== 200) {
    console.error("Credentials validation failed");
    return testResult;
  }

  try {
    // Delete existing credentials first
    const { error: deleteError } = await supabase
      .from("admin_mercado_pago_credentials")
      .delete()
      .neq("id", "placeholder");  // Delete all
    
    if (deleteError) {
      console.error("Error deleting existing credentials:", deleteError);
    }

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
      console.error("Failed to store credentials:", error);
      return new Response(
        JSON.stringify({ error: "Failed to store credentials", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Credentials stored successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Credentials stored successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in createCredentials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to store credentials", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function testCredentials(access_token) {
  try {
    console.log("Testing access token");
    // Test the access token by getting user information
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        "Authorization": `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Invalid credentials:", errorText);
      return new Response(
        JSON.stringify({ error: "Invalid credentials", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userData = await response.json();
    console.log("Credentials validated successfully");
    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Failed to test credentials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to test credentials", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function getCredentials(supabase) {
  try {
    console.log("Fetching stored credentials");
    const { data, error } = await supabase
      .from("admin_mercado_pago_credentials")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();  // Changed from .single() to .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching credentials:", error);
      return new Response(
        JSON.stringify({ error: "Error fetching credentials", details: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!data) {
      console.log("No credentials found, but returning success with has_credentials=false");
      return new Response(
        JSON.stringify({
          has_credentials: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Don't return the full access token for security
    const masked_access_token = data.access_token.substring(0, 4) + "..." + 
      data.access_token.substring(data.access_token.length - 4);

    console.log("Credentials retrieved successfully");
    return new Response(
      JSON.stringify({
        public_key: data.public_key,
        user_mercado_pago_id: data.user_mercado_pago_id,
        access_token: masked_access_token,
        has_credentials: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in getCredentials:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching credentials", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
