import { supabase } from "@/integrations/supabase/client";
import { PersonaType } from "@/hooks/useChat";
import { chatCompletion } from "@/functions/chatCompletion";
export const saveChatMessage = async (
  sessionId: string,
  content: string,
  role: string,
  userId: string | number
) => {
  // Convert userId to number, with fallback to 0
  const numericUserId = typeof userId === 'string' ? parseInt(userId) || 0 : userId;
  console.log('-------------------numericUserId', numericUserId);
  console.log('-------------------content', content);
  console.log('-------------------role', role);
  console.log('-------------------sessionId', sessionId);
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      content,
      role,
      user_id: numericUserId,
      session_id: sessionId
    });

  if (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }

  return data;
};

export const getChatResponse = async (
  message: string,
  userData: any,
  persona: PersonaType
): Promise<string> => { 
  try {
    const response = await chatCompletion(message, userData, persona);
    return response;
  } catch (error) {
    console.error("Error in getChatResponse:", error);
    throw error;
  }
};


