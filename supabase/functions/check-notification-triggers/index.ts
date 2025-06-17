
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
    
    console.log('Starting notification triggers check...')
    
    // Check for overdue invoices
    await checkOverdueInvoices(supabase)
    
    // Check for low credits
    await checkLowCredits(supabase)
    
    // Check for pending approvals (admin notifications)
    await checkPendingApprovals(supabase)
    
    console.log('Notification triggers check completed')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification triggers checked successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Error in check-notification-triggers:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function checkOverdueInvoices(supabase: any) {
  try {
    // Find invoices that are overdue and haven't been notified recently
    const { data: overdueInvoices, error } = await supabase
      .from('faturas')
      .select('*')
      .eq('status', 'pendente')
      .lt('vencimento', new Date().toISOString().split('T')[0])
    
    if (error) throw error
    
    for (const invoice of overdueInvoices || []) {
      // Check if we already sent an overdue notification in the last 24 hours
      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', invoice.user_id)
        .eq('type', 'invoice_overdue')
        .eq('related_id', invoice.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      
      if (!recentNotifications || recentNotifications.length === 0) {
        // Create overdue notification
        await supabase
          .from('notifications')
          .insert({
            user_id: invoice.user_id,
            type: 'invoice_overdue',
            title: 'Fatura vencida',
            content: `Fatura de R$ ${invoice.valor} de ${invoice.nome} está vencida desde ${new Date(invoice.vencimento).toLocaleDateString('pt-BR')}`,
            related_id: invoice.id
          })
        
        console.log(`Created overdue notification for invoice ${invoice.id}`)
      }
    }
  } catch (error) {
    console.error('Error checking overdue invoices:', error)
  }
}

async function checkLowCredits(supabase: any) {
  try {
    // Find users with low credits (5 or less)
    const { data: lowCreditUsers, error } = await supabase
      .from('user_invoice_credits')
      .select('*')
      .lte('credits_remaining', 5)
    
    if (error) throw error
    
    for (const userCredit of lowCreditUsers || []) {
      // Check if we already sent a low credits notification in the last 24 hours
      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userCredit.user_id)
        .eq('type', 'low_credits')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      
      if (!recentNotifications || recentNotifications.length === 0) {
        // Create low credits notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userCredit.user_id,
            type: 'low_credits',
            title: 'Créditos baixos',
            content: `Você possui apenas ${userCredit.credits_remaining} créditos restantes. Considere recarregar sua conta.`,
            related_id: userCredit.id
          })
        
        console.log(`Created low credits notification for user ${userCredit.user_id}`)
      }
    }
  } catch (error) {
    console.error('Error checking low credits:', error)
  }
}

async function checkPendingApprovals(supabase: any) {
  try {
    // Find pending user approvals
    const { data: pendingUsers, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('approved', false)
      .eq('status', 'pending')
    
    if (error) throw error
    
    if (pendingUsers && pendingUsers.length > 0) {
      // Find all admins
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
      
      for (const adminRole of adminRoles || []) {
        // Check if we already sent a pending approvals notification in the last 4 hours
        const { data: recentNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', adminRole.user_id)
          .eq('type', 'subscription_update')
          .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
        
        if (!recentNotifications || recentNotifications.length === 0) {
          // Create admin notification
          await supabase
            .from('notifications')
            .insert({
              user_id: adminRole.user_id,
              type: 'subscription_update',
              title: 'Usuários pendentes de aprovação',
              content: `Existem ${pendingUsers.length} usuário(s) aguardando aprovação no sistema.`
            })
          
          console.log(`Created pending approvals notification for admin ${adminRole.user_id}`)
        }
      }
    }
  } catch (error) {
    console.error('Error checking pending approvals:', error)
  }
}
