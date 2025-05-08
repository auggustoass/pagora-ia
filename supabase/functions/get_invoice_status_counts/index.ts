
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
    console.log('Request params:', { start_date, end_date, user_filter })

    // Fix: Instead of using group() which is not available, we'll count each status manually
    let query = supabaseClient
      .from('faturas')
      .select('status')
      .gte('created_at', start_date)
      .lte('created_at', end_date)

    // Apply user filter if needed
    if (user_filter) {
      query = query.eq('user_id', user_filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database query error:', error)
      throw error
    }

    console.log('Query returned data count:', data?.length || 0)

    // Count statuses manually
    const statusCounts = {}
    if (data && data.length > 0) {
      data.forEach(item => {
        if (!statusCounts[item.status]) {
          statusCounts[item.status] = 0
        }
        statusCounts[item.status]++
      })
    }

    // Convert to the expected format
    const formattedData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }))
    
    console.log('Formatted status counts:', formattedData)

    // Return the response
    return new Response(JSON.stringify(formattedData), {
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
