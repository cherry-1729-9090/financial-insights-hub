import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let { userId } = await req.json();
    console.log('-----------userId', userId);
    userId = 'eyJpdiI6IlNxZkJ2MWNjUmZnSEhpSlhHZHd4UFE9PSIsInZhbHVlIjoiSmtGVUl1ZVA1NEJOdytIeUtlb2hkUT09IiwibWFjIjoiYjc2NzdmZWRkNDE0MTMxMDI1YjFiZjQxNDJlNWFiNWNjMDYyY2ZkZGZhYjY2YmI3NDZmNGJkZjEzNjYyN2ZhOSIsInRhZyI6IiJ9'
   
    const response = await fetch("https://app.minemi.ai/api/v1/credit-profile-insights", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'userId': userId,
        'User-Agent': 'Supabase Edge Function'
      },
      body: JSON.stringify({ userId: userId })
    });

    const data = await response.json();
    console.log('-----------data', data);
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})