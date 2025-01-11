export const chatCompletion = async (message, userData, persona, fromQuestionGeneration = false) => {
  const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('-------------------openAIApiKey', openAIApiKey);
  try {
    // console.log('[User message] :', message);
    const systemMessage = `You are an AI Financial Advisor. ${persona?.situation || ''} 
    Your goal is to ${persona?.goal || 'provide helpful financial advice'}. 
    Focus on these critical data points: ${persona?.criticalDataPoints?.join(', ') || 'credit score, income, and expenses'}.
    Current user data: Credit Score: ${userData?.credit_score}, FOIR: ${userData?.foir}%, Active Loans: ${userData?.running_loan}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No response content found');
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    throw error;
  }
};