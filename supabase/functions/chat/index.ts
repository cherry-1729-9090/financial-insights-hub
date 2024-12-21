import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

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
    const { prompt } = await req.json();
    console.log('Processing prompt:', prompt);

    if (!openRouterApiKey) {
      console.error('OpenRouter API key is not configured');
      throw new Error('OpenRouter API key is not configured');
    }

    let generatedText;

    // Check if the prompt is about credit cards
    if (containsCreditCardQuery(prompt)) {
      console.log('Credit card query detected, using RAG');
      const response = await fetch(
        `${process.env.SUPABASE_URL}/functions/v1/credit-recommendations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: prompt })
        }
      );
      console.log('Credit recommendations response:', response);
      const data = await response.json();
      console.log('Credit recommendations response:', data);
      generatedText = data?.recommendation || "I apologize, but I couldn't process your request at this time.";
    } else {
      console.log('Using regular chat for non-credit card query');
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": process.env.SUPABASE_URL || '',
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

      console.log('Received response from OpenRouter');
      const data = await response.json();
      console.log('OpenRouter response:', data);
      generatedText = data.choices[0]?.message?.content || "I apologize, but I couldn't process your request at this time.";
    }

    console.log('Final generated text:', generatedText);
    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});