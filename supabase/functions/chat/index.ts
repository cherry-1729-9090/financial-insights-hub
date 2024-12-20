import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function containsCreditCardQuery(text: string): boolean {
  const creditCardKeywords = [
    'credit card', 'credit cards', 'card recommendation', 'card suggestions',
    'which card', 'best card', 'recommend a card'
  ];
  return creditCardKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    let generatedText;

    // Check if the prompt is about credit cards
    if (containsCreditCardQuery(prompt)) {
      console.log('Credit card query detected, using RAG');
      const response = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/credit-recommendations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: prompt })
        }
      );

      const data = await response.json();
      generatedText = data.recommendation;
    } else {
      // Use regular chat for non-credit card queries
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
              content: "You are a helpful financial advisor. Provide clear, concise advice based on best financial practices. Keep responses under 150 words."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      generatedText = data.choices[0]?.message?.content || "I apologize, but I couldn't process your request at this time.";
    }

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});