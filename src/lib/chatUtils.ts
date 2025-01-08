import { supabase } from "@/integrations/supabase/client";

const systemPrompt = (userData: any, persona: any, chatHistory: string[]) => `
You are a helpful financial advisor.
Provide clear, concise advice based on best financial practices.
Never encourage vulgar, explicit, or inappropriate behavior.
User's credit profile: ${JSON.stringify(userData)}
User's persona: ${JSON.stringify(persona)}
Chat history: ${JSON.stringify(chatHistory)}
Note: You are the best financial advisor in the world, and you are the best at giving advice to users based on their credit profile and persona.
`;

export const getChatResponse = async (prompt: string, userData: any, persona: any) => {
  try {
    // Generate response based on user's financial profile
    const creditScore = parseInt(userData?.credit_score || '0');
    const foir = parseInt(userData?.foir || '0');
    const utilization = parseInt(userData?.credit_utilization || '0');
    
    let response = '';

    // Basic logic to generate responses based on user's financial profile
    if (creditScore < 650) {
      response = "Based on your credit score, I recommend focusing on improving your credit history. Here are some steps you can take: 1) Ensure timely payments 2) Reduce credit utilization 3) Avoid new credit applications for now.";
    } else if (creditScore >= 650 && creditScore < 750) {
      if (foir > 55) {
        response = "Your FOIR (Fixed Obligations to Income Ratio) is on the higher side. Consider debt consolidation or restructuring to reduce monthly obligations.";
      } else if (utilization > 80) {
        response = "Your credit utilization is high. Try to bring it down below 30% by either reducing credit card usage or requesting credit limit increases.";
      } else {
        response = "Your credit profile is moderate. Focus on maintaining regular payments and gradually reducing debt to improve your score further.";
      }
    } else {
      response = "You have a good credit score! Consider optimizing your credit mix and maintaining your excellent payment history. You might be eligible for premium credit products.";
    }

    // Add personalized advice based on the persona
    if (persona?.goal) {
      response += `\n\nConsidering your goal to ${persona.goal}, here's what you can do:`;
      persona.criticalDataPoints.forEach((point: string) => {
        response += `\n- Monitor your ${point} closely`;
      });
    }

    return response;
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I apologize, but I'm having trouble processing your request. Please try again or rephrase your question.";
  }
};

export const saveChatMessage = async (sessionId: string, content: string, role: 'user' | 'assistant', userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content,
        role,
        user_id: userId
      });

    if (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in saveChatMessage:", error);
    throw error;
  }
};