import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Received chat request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request = await req.json();
    const {prompt, userData, persona} = request;
    console.log('Processing prompt:', prompt);
    console.log('UserData : ', userData);
    console.log('Persona : ', persona);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const chatHistory = await supabase.from('chat_history').select('*').eq('user_id', userData.id);
    // Check for credit card related queries
    const isCreditCardQuery = prompt.toLowerCase().includes('credit card') || 
                            prompt.toLowerCase().includes('card recommendation') ||
                            prompt.toLowerCase().includes('card benefits');
    let creditCardInfo = '';
    
    // if (isCreditCardQuery) {
    //   console.log('Credit card query detected, performing vector search...');
      
    //   try {
    //     // Generate embedding for the query
    //     const embedding = await generateEmbedding(prompt);
        
    //     // Perform vector search using existing embedding column
    //     const cards = await performVectorSearch(supabase, embedding, prompt);

    //     if (cards && cards.length > 0) {
    //       creditCardInfo = '\n\nBased on semantic search, here are the most relevant credit card recommendations:\n\n' +
    //         cards.map(card => 
    //           `${card.card_name} from ${card.bank_name}:\n` +
    //           `- Annual fee: ${card.annual_fee}\n` +
    //           `- Features: ${card.features}\n`
    //         ).join('\n');
    //     }
    //   } catch (error) {
    //     console.error('Error in vector search:', error);
    //     // Fallback to regular search if vector search fails
    //     const { data: cards, error: searchError } = await supabase
    //       .from('credit_cards')
    //       .select('*')

    //     if (searchError) {
    //       console.error('Error in fallback search:', searchError);
    //     } else if (cards && cards.length > 0) {
    //       creditCardInfo = '\n\nBased on your query, here are some credit card recommendations:\n\n' +
    //         cards.map(card => 
    //           `${card.card_name} from ${card.bank_name}:\n` +
    //           `- Annual fee: ${card.annual_fee}\n` +
    //           `- Features: ${card.features}\n`
    //         ).join('\n');
    //     }
    //   }
    // }


    // Get OpenRouter API response
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key is not configured');
      throw new Error('OpenRouter API key is not configured');
    }

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
        model: "anthropic/claude-3-sonnet",
        messages: [
          {
            role: "system",
            content: 
            // isCreditCardQuery
            //   ? `You are a helpful financial advisor specializing in credit cards.
            //     Analyze the user's query and the provided credit card recommendations.
            //     Provide clear, concise advice and explain which cards might be most suitable and why.
            //     Based on the user's credit profile, and available credit cards, provide the best possible advice.
            //     User's credit profile : ${JSON.stringify(userData)}
            //     User's persona : ${JSON.stringify(persona)}
            //     Note : You are the best financial advisor in the world, and you are the best at giving advice to users based
            //     on their credit profile and persona.
            //     Never encourage vulgar, explicit, or inappropriate behavior.`
            //   : 
              `You are a helpful financial advisor.
                Provide clear, concise advice based on best financial practices.
                Never encourage vulgar, explicit, or inappropriate behavior.
                User's credit profile : ${JSON.stringify(userData)}
                User's persona : ${JSON.stringify(persona)}
                Note : You are the best financial advisor in the world, and you are the best at giving advice to users based
                on their credit profile and persona.
                Chat history : ${JSON.stringify(chatHistory)}
                So based on the chat history, you can give the best possible advice to the user.
                `
          },
          {
            role: "user",
            content: prompt 
            // + (creditCardInfo ? "\n\nAvailable credit cards:" + creditCardInfo : "")
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

async function performVectorSearch(supabase: any, queryEmbedding: number[], queryText: string, limit = 3) {
  console.log('Performing hybrid search (vector + full-text)');

  const embeddingVector = `[${queryEmbedding.join(',')}]`;

  const { data: similarCards, error } = await supabase
    .from('credit_cards')
    .select(`
      *, 
      (embedding <-> '${embeddingVector}'::vector) AS similarity,
      ts_rank_cd(to_tsvector('english', features), plainto_tsquery(${queryText})) AS text_rank
    `)
    .order(`similarity`)
    .order(`text_rank`, { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Hybrid search error:', error);
    throw error;
  }

  console.log('Hybrid search results:', similarCards);
  return similarCards;
}