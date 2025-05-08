
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { 
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse the request body
    const { start_date, end_date, user_filter } = await req.json()

    // Build the base query
    let invoiceQuery = supabaseClient
      .from('faturas')
      .select('*')

    // Apply date range
    if (start_date && end_date) {
      invoiceQuery = invoiceQuery
        .gte('created_at', start_date)
        .lte('created_at', end_date)
    }

    // Apply user filter if needed
    if (user_filter && user_filter !== 'all') {
      invoiceQuery = invoiceQuery.eq('user_id', user_filter)
    }

    // Get invoice data
    const { data: invoiceData, error: invoiceError } = await invoiceQuery

    if (invoiceError) throw invoiceError

    // Calculate metrics
    const totalInvoices = invoiceData ? invoiceData.length : 0
    const totalValue = invoiceData ? 
      invoiceData.reduce((sum, inv) => sum + Number(inv.valor || 0), 0) : 0
    
    const averageValue = totalInvoices > 0 ? totalValue / totalInvoices : 0

    // Count by status
    const statusCounts = {}
    if (invoiceData) {
      invoiceData.forEach(invoice => {
        if (!statusCounts[invoice.status]) {
          statusCounts[invoice.status] = 0
        }
        statusCounts[invoice.status]++;
      })
    }

    // Calculate payment time average (if payment_date exists)
    let totalPaymentDays = 0
    let paidInvoicesCount = 0
    
    if (invoiceData) {
      invoiceData.forEach(invoice => {
        if (invoice.payment_date && invoice.created_at) {
          const createdDate = new Date(invoice.created_at)
          const paymentDate = new Date(invoice.payment_date)
          const daysDiff = Math.floor((paymentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff >= 0) {
            totalPaymentDays += daysDiff
            paidInvoicesCount++
          }
        }
      })
    }
    
    const avgPaymentDays = paidInvoicesCount > 0 ? totalPaymentDays / paidInvoicesCount : 0

    // Monthly invoice values
    const monthlyValues = {}
    if (invoiceData) {
      invoiceData.forEach(invoice => {
        if (invoice.created_at) {
          const date = new Date(invoice.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyValues[monthKey]) {
            monthlyValues[monthKey] = 0
          }
          
          monthlyValues[monthKey] += Number(invoice.valor || 0)
        }
      })
    }

    // Group invoices by value range
    const valueRanges = {
      "0-100": 0,
      "100-500": 0,
      "500-1000": 0,
      "1000-5000": 0,
      "5000+": 0
    }

    if (invoiceData) {
      invoiceData.forEach(invoice => {
        const value = Number(invoice.valor || 0)
        
        if (value <= 100) valueRanges["0-100"]++
        else if (value <= 500) valueRanges["100-500"]++
        else if (value <= 1000) valueRanges["500-1000"]++
        else if (value <= 5000) valueRanges["1000-5000"]++
        else valueRanges["5000+"]++
      })
    }

    // Prepare and return the response
    const response = {
      totalInvoices,
      totalValue,
      averageValue,
      statusCounts,
      avgPaymentDays,
      monthlyValues: Object.entries(monthlyValues).map(([month, value]) => ({
        month,
        value
      })),
      valueRanges: Object.entries(valueRanges).map(([range, count]) => ({
        range,
        count
      }))
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
