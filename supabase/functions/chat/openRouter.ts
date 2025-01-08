const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not configured');
}

export async function getAIResponse(prompt: string, systemMessage: string) {
  console.log('Requesting AI response with prompt:', prompt);
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SUPABASE_URL || '',
        "X-Title": "Financial Advisor Chat"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",  // Using a more cost-effective model
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      
      // If we get a 402 (insufficient credits), use a fallback response
      if (response.status === 402) {
        return "I apologize, but I'm currently experiencing some technical limitations. I can still help you with basic financial advice based on your profile. What specific aspect of your finances would you like to discuss?";
      }
      
      throw new Error(`Failed to get AI response: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    // Provide a graceful fallback response
    return "I apologize, but I'm having trouble processing your request at the moment. Please try again in a few moments, or feel free to ask a different question about your financial situation.";
  }
}