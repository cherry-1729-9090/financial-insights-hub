import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Received credit recommendations request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Processing query:', query);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query credit cards table
    const { data: cards, error } = await supabase
      .from('credit_cards')
      .select('*')
      .limit(3);

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    console.log('Found credit cards:', cards);

    // Format recommendation
    const recommendation = `Based on your query "${query}", here are some credit card recommendations:\n\n` +
      cards.map(card => 
        `${card.card_name} from ${card.bank_name}:\n` +
        `- Annual fee: ${card.annual_fee}\n` +
        `- Features: ${card.features}\n`
      ).join('\n');

    return new Response(
      JSON.stringify({ recommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in credit recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});