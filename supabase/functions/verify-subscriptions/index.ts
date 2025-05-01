
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
    console.log("Running verify-subscriptions function");
    
    const now = new Date();
    
    // Find all trial subscriptions where trial period has ended
    const { data: expiredTrials, error: trialError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "trial")
      .lt("trial_ends_at", now.toISOString());
    
    if (trialError) {
      console.error("Error fetching expired trials:", trialError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch expired trials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`Found ${expiredTrials?.length || 0} expired trials`);
    
    // Process each expired trial
    const updates = [];
    for (const subscription of expiredTrials || []) {
      // If we have a Mercado Pago subscription ID, check its status
      if (subscription.mercado_pago_subscription_id) {
        // This should be handled by the webhook, but we can double-check here
        console.log(`Subscription ${subscription.id} has MP ID ${subscription.mercado_pago_subscription_id}, leaving for webhook to handle`);
        continue;
      } else {
        // No payment method set up, mark as expired
        console.log(`Subscription ${subscription.id} has no payment method, marking as expired`);
        updates.push(supabase
          .from("subscriptions")
          .update({
            status: "expired",
            end_date: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq("id", subscription.id)
        );
      }
    }
    
    // Execute all update operations
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`Updated ${updates.length} subscriptions`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: updates.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error verifying subscriptions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
