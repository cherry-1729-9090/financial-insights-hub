import { supabase } from "@/integrations/supabase/client";
import { PersonaType } from "@/hooks/useChat";
import { chatCompletion } from "@/functions/chatCompletion";
export const saveChatMessage = async (
  sessionId: string,
  content: string,
  role: string,
  payload: string
) => {
  // Convert userId to number, with fallback to 0
  console.log('[saveChatMessage] [payload]', payload);
  console.log('[saveChatMessage] [content]', content);
  
  console.log('[saveChatMessage] [role]', role);
  console.log('[saveChatMessage] [sessionId]', sessionId);
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      content,
      role,
      user_id: payload,
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


