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
    const { userId } = await req.json();
    console.log('-----------userId', userId);
    
    // Use the encrypted token format from Postman
    const encryptedToken = "eyJpdiI6IlFCQkVGMmFHajRyWDBVUVRqM0ZQV1E9PSIsInZhbHVlIjoiZzhRME5zSWVpUDRjRXo0M1MxNE5zQT09IiwibWFjIjoiODcyZjU3ZDY0ZDc2OGQ1NDgxMzJjNjk2MjE4ZjhjZDkwNDFkN2Y5YjVjMGEzNzdiZjAzN2ZmYzk3ODRjY2IwMiIsInRhZyI6IiJ9";
    
    const response = await fetch("https://app.minemi.ai/api/v1/credit-profile-insights", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'userId': encryptedToken,
        'User-Agent': 'Supabase Edge Function'
      },
      body: JSON.stringify({ userId: encryptedToken })
    });

    const data = await response.json();

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