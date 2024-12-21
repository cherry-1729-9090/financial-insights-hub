import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateEmbedding(text: string) {
  console.log('Generating embedding for:', text);
  const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
  
  if (!togetherApiKey) {
    throw new Error('TOGETHER_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'togethercomputer/m2-bert-80M-8k-base',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${await response.text()}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function performVectorSearch(supabase: any, queryEmbedding: number[], limit = 3) {
  console.log('Performing vector search');
  
  const { data: similarCards, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order(`embedding <-> '[${queryEmbedding.join(',')}]'::vector`)
    .limit(limit);

  if (error) {
    console.error('Vector search error:', error);
    throw error;
  }

  console.log('Vector search results:', similarCards);
  return similarCards;
}

serve(async (req) => {
  console.log('Received chat request');
  
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

    // Check for credit card related queries
    const isCreditCardQuery = prompt.toLowerCase().includes('credit card') || 
                            prompt.toLowerCase().includes('card recommendation') ||
                            prompt.toLowerCase().includes('card benefits');

    let creditCardInfo = '';
    
    if (isCreditCardQuery) {
      console.log('Credit card query detected, performing vector search...');
      
      try {
        // Generate embedding for the query
        const embedding = await generateEmbedding(prompt);
        
        // Perform vector search using existing embedding column
        const cards = await performVectorSearch(supabase, embedding);

        if (cards && cards.length > 0) {
          creditCardInfo = '\n\nBased on semantic search, here are the most relevant credit card recommendations:\n\n' +
            cards.map(card => 
              `${card.card_name} from ${card.bank_name}:\n` +
              `- Annual fee: ${card.annual_fee}\n` +
              `- Features: ${card.features}\n`
            ).join('\n');
        }
      } catch (error) {
        console.error('Error in vector search:', error);
        // Fallback to regular search if vector search fails
        const { data: cards, error: searchError } = await supabase
          .from('credit_cards')
          .select('*')
          .limit(3);

        if (searchError) {
          console.error('Error in fallback search:', searchError);
        } else if (cards && cards.length > 0) {
          creditCardInfo = '\n\nBased on your query, here are some credit card recommendations:\n\n' +
            cards.map(card => 
              `${card.card_name} from ${card.bank_name}:\n` +
              `- Annual fee: ${card.annual_fee}\n` +
              `- Features: ${card.features}\n`
            ).join('\n');
        }
      }
    }

    // Get OpenRouter API response
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key is not configured');
      throw new Error('OpenRouter API key is not configured');
    }

    const systemPrompt = isCreditCardQuery 
      ? "You are a helpful financial advisor specializing in credit cards. Analyze the user's query and the provided credit card recommendations. Provide clear, concise advice and explain which cards might be most suitable and why. Format your responses using markdown for better readability."
      : "You are a helpful financial advisor. Provide clear, concise advice based on best financial practices. Format your responses using markdown for better readability. Use bullet points and headers where appropriate.";

    console.log('Requesting AI response...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": supabaseUrl,
        "X-Title": "Financial Advisor Chat"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt + (creditCardInfo ? "\n\nAvailable credit cards:" + creditCardInfo : "")
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
    console.log('OpenRouter response received');

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