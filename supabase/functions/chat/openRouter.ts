const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not configured');
}

export async function getAIResponse(prompt: string, systemMessage: string) {
  console.log('Requesting AI response with prompt:', prompt);
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SUPABASE_URL || '',
      "X-Title": "Financial Advisor Chat"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-sonnet",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', errorText);
    throw new Error(`Failed to get AI response: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}