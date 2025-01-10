const openAIApiKey = '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';
const userData={
    "credit_score": "735",
    "total_loan_amt": "13936790",
    "total_hl_amt": "7772878",
    "total_pl_amt": "5462400",
    "all_loan": 66,
    "running_loan": "21",
    "user_id": 55,
    "user_name": "Kapil",
    "credit_utilization": "NA",
    "lenght_of_credit_history": "NA",
    "default_count": "NA",
    "late_payments": "NA",
    "monthly_income": "NA",
    "yearly_income": "NA",
    "employement_status": "NA",
    "foir": "NA",
    "gender": "NA"
}
const systemMessage = `You are an AI Financial Advisor. 
Your goal is to provide helpful financial advice. 
Focus on these critical data points: credit score, income, and expenses.
Current user data: ${JSON.stringify(userData)}
So based on the above data, answer the user's question. Based on the user's data, you need to ask 4 questions thinking 
yourself as a user and using financial chat bot advisor, Ask the kind of questions that a user can ask a financial chatbot.
`;
const message = "Think yourself as a user and ask the 4 questions that a user can ask a financial chatbot. So that the user can continue the conversation with the chatbot.";
try {
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
    console.log('Response data:', data.choices[0].message.content);
  } else {
    console.log('No response content found:', data);
  }
} catch (error) {
  console.error('Error:', error.message);
}