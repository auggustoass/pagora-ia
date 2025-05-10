
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
    console.log('Request params for client statistics:', { start_date, end_date, user_filter })
    
    // Get current user information to check if admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      console.error('Error getting user:', userError)
      throw userError
    }
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('is_admin')
    
    if (roleError) {
      console.error('Error checking admin status:', roleError)
      throw roleError
    }
    
    const isAdmin = roleData || false
    console.log('User admin status:', isAdmin)

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
    // For admins: if user_filter is specified, filter by that user_id, otherwise show all
    // For regular users: always filter by their user_id regardless of user_filter
    if (!isAdmin) {
      // Regular users can only see their own data
      clientsQuery = clientsQuery.eq('user_id', user.id)
      console.log('Filtering clients for regular user:', user.id)
    } else if (user_filter && user_filter !== 'all') {
      // Admin can filter by specific user
      clientsQuery = clientsQuery.eq('user_id', user_filter)
      console.log('Admin filtering clients by specific user:', user_filter)
    }

    const { count: totalClients, error: clientsError } = await clientsQuery

    if (clientsError) {
      console.error('Error getting client count:', clientsError)
      throw clientsError
    }
    
    console.log('Total clients found:', totalClients)

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

    // Apply same user filtering logic as above
    if (!isAdmin) {
      clientGrowthQuery = clientGrowthQuery.eq('user_id', user.id)
    } else if (user_filter && user_filter !== 'all') {
      clientGrowthQuery = clientGrowthQuery.eq('user_id', user_filter)
    }

    const { data: clientsData, error: growthError } = await clientGrowthQuery

    if (growthError) {
      console.error('Error getting client growth data:', growthError)
      throw growthError
    }
    
    console.log('Clients data for growth chart:', clientsData?.length || 0, 'records')

    // Process client growth data by month
    const monthlyGrowth = {}
    if (clientsData && clientsData.length > 0) {
      clientsData.forEach(client => {
        const date = new Date(client.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyGrowth[monthKey]) {
          monthlyGrowth[monthKey] = 0
        }
        
        monthlyGrowth[monthKey]++
      })
    } else {
      console.log('No client data available for growth chart')
    }

    // Get top clients by invoice value
    let topClientsQuery = supabaseClient
      .from('clients')
      .select(`
        id,
        nome,
        faturas:faturas(valor)
      `)

    // Apply same user filtering logic
    if (!isAdmin) {
      topClientsQuery = topClientsQuery.eq('user_id', user.id)
    } else if (user_filter && user_filter !== 'all') {
      topClientsQuery = topClientsQuery.eq('user_id', user_filter)
    }
    
    // Apply limit
    topClientsQuery = topClientsQuery.limit(10)
    
    const { data: topClients, error: topClientsError } = await topClientsQuery

    if (topClientsError) {
      console.error('Error getting top clients:', topClientsError)
      throw topClientsError
    }
    
    console.log('Top clients data:', topClients?.length || 0, 'records')

    // Calculate total invoice value for each client
    const topClientsWithTotals = topClients
      .map(client => ({
        id: client.id,
        nome: client.nome,
        total: client.faturas.reduce((sum, invoice) => sum + Number(invoice.valor || 0), 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
    
    console.log('Top clients with calculated totals:', topClientsWithTotals.length)

    // Prepare and return the response
    const response = {
      totalClients,
      monthlyGrowth: Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        count
      })),
      topClients: topClientsWithTotals
    }
    
    console.log('Response prepared successfully')

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing client statistics request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
