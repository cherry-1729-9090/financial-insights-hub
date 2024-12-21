import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Processing prompt:', prompt);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the prompt is related to credit cards
    const isCreditCardQuery = prompt.toLowerCase().includes('credit card') || 
                            prompt.toLowerCase().includes('card recommendation') ||
                            prompt.toLowerCase().includes('card benefits');

    let creditCardInfo = '';
    
    if (isCreditCardQuery) {
      console.log('Credit card query detected, fetching relevant cards...');
      
      // Perform a basic search on credit cards
      const { data: cards, error: searchError } = await supabase
        .from('credit_cards')
        .select('*')
        .limit(3);

      if (searchError) {
        console.error('Error searching credit cards:', searchError);
      } else if (cards && cards.length > 0) {
        creditCardInfo = '\n\nBased on your query, here are some credit card recommendations:\n\n' +
          cards.map(card => 
            `${card.card_name} from ${card.bank_name}:\n` +
            `- Annual fee: ${card.annual_fee}\n` +
            `- Features: ${card.features}\n`
          ).join('\n');
      }
    }

    // Generate AI response
    const response = `Here's my response to your question about ${prompt}. ${creditCardInfo}`;

    console.log('Sending response with credit card information');
    
    return new Response(
      JSON.stringify({ content: response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});