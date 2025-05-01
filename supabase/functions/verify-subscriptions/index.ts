
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const mercadoPagoAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";

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
      .select("*, mercado_pago_credentials!inner(*)")
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
      console.log(`Processing expired trial subscription ${subscription.id}`);
      
      // If we have a Mercado Pago subscription ID, check its status
      if (subscription.mercado_pago_subscription_id) {
        try {
          // Use the user's access token or fall back to default
          const accessToken = subscription.mercado_pago_credentials?.access_token || mercadoPagoAccessToken;
          
          if (!accessToken) {
            console.log(`No access token available for subscription ${subscription.id}, marking as expired`);
            updates.push(supabase
              .from("subscriptions")
              .update({
                status: "expired",
                end_date: now.toISOString(),
                updated_at: now.toISOString()
              })
              .eq("id", subscription.id)
            );
            continue;
          }
          
          // Check subscription status in Mercado Pago
          console.log(`Checking MP subscription ${subscription.mercado_pago_subscription_id}`);
          const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercado_pago_subscription_id}`, {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          });
          
          if (!mpResponse.ok) {
            console.error(`Error checking MP subscription: ${mpResponse.status}`);
            // If error, mark as expired
            updates.push(supabase
              .from("subscriptions")
              .update({
                status: "expired",
                end_date: now.toISOString(),
                updated_at: now.toISOString()
              })
              .eq("id", subscription.id)
            );
            continue;
          }
          
          const mpData = await mpResponse.json();
          console.log(`MP subscription status: ${mpData.status}`);
          
          // Update based on Mercado Pago status
          let newStatus;
          let paymentStatus;
          
          switch (mpData.status) {
            case "authorized":
              newStatus = "active";
              paymentStatus = "paid";
              break;
            case "paused":
              newStatus = "paused";
              paymentStatus = "pending";
              break;
            case "cancelled":
              newStatus = "canceled";
              paymentStatus = "canceled";
              break;
            case "pending":
              // Still pending approval, but trial has ended - mark as grace period
              newStatus = "grace";
              paymentStatus = "pending";
              break;
            default:
              newStatus = "expired";
              paymentStatus = "failed";
          }
          
          updates.push(supabase
            .from("subscriptions")
            .update({
              status: newStatus,
              payment_status: paymentStatus,
              updated_at: now.toISOString(),
              end_date: newStatus === "expired" || newStatus === "canceled" ? now.toISOString() : null
            })
            .eq("id", subscription.id)
          );
          
        } catch (error) {
          console.error(`Error processing MP subscription for ${subscription.id}:`, error);
          // On error, mark as expired
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
