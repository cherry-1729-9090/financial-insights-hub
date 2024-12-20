import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Together } from 'npm:together';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateEmbedding(text: string) {
  try {
    const together = new Together({ apiKey: Deno.env.get('TOGETHER_API_KEY') });
    const response = await together.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: text,
    });

    if (response.data && response.data[0]?.embedding) {
      return response.data[0].embedding;
    } else {
      throw new Error("Invalid embedding format from Together API");
    }
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function findSimilarCreditCards(embedding: number[], limit = 3) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: cards, error } = await supabase.rpc('match_credit_cards', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit
  });

  if (error) throw error;
  return cards;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Received query:', query);

    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    console.log('Generated embedding');

    // Find similar credit cards
    const similarCards = await findSimilarCreditCards(embedding);
    console.log('Found similar cards:', similarCards);

    // Format cards for the LLM context
    const cardsContext = similarCards.map(card => 
      `${card.card_name} from ${card.bank_name}: Annual fee: ${card.annual_fee}, Features: ${card.features}`
    ).join('\n');

    const prompt = `Based on the user's query "${query}" and these relevant credit cards:\n\n${cardsContext}\n\nProvide a helpful recommendation. Focus on matching the user's needs with the card features. Keep the response under 150 words.`;

    // Use OpenRouter for response generation (reusing existing chat function)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        "HTTP-Referer": Deno.env.get('SUPABASE_URL') || '',
        "X-Title": "Financial Advisor Chat"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor specializing in credit card recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const result = await response.json();
    const recommendation = result.choices[0]?.message?.content || 
      "I apologize, but I couldn't process your credit card recommendation request at this time.";

    return new Response(
      JSON.stringify({ recommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});