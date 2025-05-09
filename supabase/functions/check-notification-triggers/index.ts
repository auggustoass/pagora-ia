
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'

// Set up CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log('Starting scheduled notification checks')
    
    // 1. Check for overdue invoices
    const today = new Date()
    const overdueInvoices = await checkOverdueInvoices(supabase, today)
    console.log(`Found ${overdueInvoices.length} overdue invoices`)
    
    // 2. Check for low credits
    const lowCreditsUsers = await checkLowCredits(supabase)
    console.log(`Found ${lowCreditsUsers.length} users with low credits`)
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        overdueNotificationsSent: overdueInvoices.length,
        lowCreditsNotificationsSent: lowCreditsUsers.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Error checking notification triggers:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Function to check for overdue invoices and generate notifications
async function checkOverdueInvoices(supabase, today) {
  const todayString = today.toISOString().split('T')[0]
  
  // Get all overdue invoices that have not been paid
  const { data: overdueInvoices, error } = await supabase
    .from('faturas')
    .select('id, user_id, nome, valor, vencimento')
    .lt('vencimento', todayString)
    .eq('status', 'pendente')
    .neq('payment_status', 'approved')
  
  if (error) {
    console.error('Error fetching overdue invoices:', error)
    return []
  }
  
  // Generate notifications for each overdue invoice
  const notificationPromises = overdueInvoices.map(async (invoice) => {
    // Check if a notification for this invoice already exists
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_id', invoice.id)
      .eq('type', 'invoice_overdue')
      .gt('created_at', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    
    // Skip if notification was already sent in the last 24 hours
    if (existingNotifications?.length > 0) {
      return null
    }
    
    // Format currency
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(invoice.valor)
    
    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: invoice.user_id,
        type: 'invoice_overdue',
        title: 'Fatura em atraso',
        content: `A fatura de ${formattedValue} para cliente ${invoice.nome} está em atraso. Vencimento: ${new Date(invoice.vencimento).toLocaleDateString('pt-BR')}.`,
        related_id: invoice.id,
        read: false
      })
    
    if (error) {
      console.error('Error creating overdue notification:', error)
      return null
    }
    
    return data
  })
  
  const results = await Promise.all(notificationPromises)
  return results.filter(Boolean)
}

// Function to check for users with low credits
async function checkLowCredits(supabase) {
  // Get users with credits below threshold (e.g., 10 credits)
  const { data: lowCreditsUsers, error } = await supabase
    .from('user_invoice_credits')
    .select('id, user_id, credits_remaining, plan_id')
    .lt('credits_remaining', 10)
  
  if (error) {
    console.error('Error fetching low credits users:', error)
    return []
  }
  
  // Generate notifications for each user with low credits
  const notificationPromises = lowCreditsUsers.map(async (creditInfo) => {
    // Check if a notification for this user already exists
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', creditInfo.user_id)
      .eq('type', 'low_credits')
      .gt('created_at', new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    
    // Skip if notification was already sent in the last 24 hours
    if (existingNotifications?.length > 0) {
      return null
    }
    
    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: creditInfo.user_id,
        type: 'low_credits',
        title: 'Créditos acabando',
        content: `Você tem apenas ${creditInfo.credits_remaining} créditos restantes. Adquira mais créditos para continuar gerando faturas.`,
        read: false
      })
    
    if (error) {
      console.error('Error creating low credits notification:', error)
      return null
    }
    
    return data
  })
  
  const results = await Promise.all(notificationPromises)
  return results.filter(Boolean)
}
