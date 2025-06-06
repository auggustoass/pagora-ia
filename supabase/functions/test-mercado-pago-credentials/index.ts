
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Updated validation with more flexible token requirements
function validateTokenFormat(token: string, type: 'access' | 'public'): { isValid: boolean; message?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, message: `${type} token é obrigatório` };
  }

  if (!token.startsWith('APP_USR-')) {
    return { isValid: false, message: `${type} token deve começar com APP_USR-` };
  }

  // Updated minimum length requirements to be more realistic
  const minLength = type === 'access' ? 60 : 30;
  if (token.length < minLength) {
    return { isValid: false, message: `${type} token parece estar incompleto (deve ter pelo menos ${minLength} caracteres)` };
  }

  return { isValid: true };
}

// Determine environment based on token
function getEnvironment(token: string): 'production' | 'sandbox' {
  // Production tokens typically have different patterns
  // This is a simple heuristic - you might need to adjust based on actual token patterns
  return token.includes('PROD') || !token.includes('TEST') ? 'production' : 'sandbox';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Request received by test-mercado-pago-credentials function");
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Usuário não autenticado",
          details: "Missing authorization header" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the user's token for authentication
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha na autenticação",
          details: "Token de usuário inválido" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

    // Get the access token from the request body
    const requestData = await req.json();
    const { access_token, environment = 'auto' } = requestData;

    if (!access_token) {
      console.error("Missing access_token in request");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Access Token obrigatório",
          details: "Forneça o Access Token para testar a conexão" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Received token with length: ${access_token.length}`);

    // Validate token format with updated validation
    const validation = validateTokenFormat(access_token, 'access');
    if (!validation.isValid) {
      console.error("Invalid token format:", validation.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Formato de token inválido",
          details: validation.message 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Determine environment
    const detectedEnv = environment === 'auto' ? getEnvironment(access_token) : environment;
    console.log(`Testing ${detectedEnv} credentials`);

    // Test the access token by calling Mercado Pago API
    console.log("Testing access token with Mercado Pago API");
    const response = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      
      let errorMessage = "Credenciais inválidas";
      let details = "";
      
      if (response.status === 401) {
        errorMessage = "Access Token inválido ou expirado";
        details = "Verifique se o token foi copiado corretamente e se sua conta Mercado Pago está ativa";
      } else if (response.status === 403) {
        errorMessage = "Acesso negado";
        details = "Sua conta pode não ter as permissões necessárias ou não estar aprovada";
      } else if (response.status === 429) {
        errorMessage = "Muitas tentativas";
        details = "Aguarde alguns minutos antes de tentar novamente";
      } else {
        details = `Erro HTTP ${response.status}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: details,
          environment: detectedEnv,
          statusCode: response.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userData = await response.json();
    console.log("Credentials validated successfully for user:", userData.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          country_id: userData.country_id,
          site_id: userData.site_id
        },
        environment: detectedEnv,
        message: `Conectado com sucesso ao ambiente de ${detectedEnv === 'production' ? 'produção' : 'teste'}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in test-mercado-pago-credentials function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Erro interno do servidor", 
        details: "Ocorreu um erro inesperado ao testar as credenciais. Tente novamente."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
