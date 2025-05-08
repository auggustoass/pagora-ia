
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

    // Get total clients count
    let clientsQuery = supabaseClient
      .from('clients')
      .select('*', { count: 'exact', head: true })

    // Apply date range
    if (start_date && end_date) {
      clientsQuery = clientsQuery
        .gte('created_at', start_date)
        .lte('created_at', end_date)
    }

    // Apply user filter if needed
    if (user_filter && user_filter !== 'all') {
      clientsQuery = clientsQuery.eq('user_id', user_filter)
    }

    const { count: totalClients, error: clientsError } = await clientsQuery

    if (clientsError) throw clientsError

    // Get new clients per month (for growth chart)
    let clientGrowthQuery = supabaseClient
      .from('clients')
      .select('created_at')
      .order('created_at', { ascending: true })

    // Apply date filters
    if (start_date && end_date) {
      clientGrowthQuery = clientGrowthQuery
        .gte('created_at', start_date)
        .lte('created_at', end_date)
    }

    // Apply user filter if needed
    if (user_filter && user_filter !== 'all') {
      clientGrowthQuery = clientGrowthQuery.eq('user_id', user_filter)
    }

    const { data: clientsData, error: growthError } = await clientGrowthQuery

    if (growthError) throw growthError

    // Process client growth data by month
    const monthlyGrowth = {}
    if (clientsData) {
      clientsData.forEach(client => {
        const date = new Date(client.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyGrowth[monthKey]) {
          monthlyGrowth[monthKey] = 0
        }
        
        monthlyGrowth[monthKey]++
      })
    }

    // Get top clients by invoice value
    const { data: topClients, error: topClientsError } = await supabaseClient
      .from('clients')
      .select(`
        id,
        nome,
        faturas:faturas(valor)
      `)
      .limit(10)

    if (topClientsError) throw topClientsError

    // Calculate total invoice value for each client
    const topClientsWithTotals = topClients
      .map(client => ({
        id: client.id,
        nome: client.nome,
        total: client.faturas.reduce((sum, invoice) => sum + Number(invoice.valor || 0), 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Prepare and return the response
    const response = {
      totalClients,
      monthlyGrowth: Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        count
      })),
      topClients: topClientsWithTotals
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
