import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function containsCreditCardQuery(text: string): boolean {
  console.log('Checking if query is about credit cards:', text);
  const creditCardKeywords = [
    'credit card', 'credit cards', 'card recommendation', 'card suggestions',
    'which card', 'best card', 'recommend a card'
  ];
  const isCardQuery = creditCardKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  console.log('Is credit card query:', isCardQuery);
  return isCardQuery;
}

serve(async (req) => {
  console.log('Received chat request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { prompt } = requestData;
    
    if (!prompt) {
      throw new Error('No prompt provided');
    }
    
    console.log('Processing prompt:', prompt);

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key is not configured');
      throw new Error('OpenRouter API key is not configured');
    }

    if (containsCreditCardQuery(prompt)) {
      console.log('Credit card query detected, using credit recommendations endpoint');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/credit-recommendations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: prompt })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Credit recommendations error:', errorText);
        throw new Error(`Failed to get credit recommendations: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Credit recommendations response:', data);
      
      return new Response(
        JSON.stringify({ content: data?.recommendation || "I apologize, but I couldn't process your request at this time." }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Using regular chat for non-credit card query');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": Deno.env.get('SUPABASE_URL') || '',
        "X-Title": "Financial Advisor Chat"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor. Provide clear, concise advice based on best financial practices. Format your responses using markdown for better readability. Use bullet points and headers where appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      throw new Error(`Failed to get AI response: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', data);

    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});