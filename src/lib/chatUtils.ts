import { supabase } from "@/integrations/supabase/client";
import { PersonaType } from "@/hooks/useChat";

export const saveChatMessage = async (
  sessionId: string,
  content: string,
  role: string,
  userId: string | number
) => {
  // Convert userId to number, with fallback to 0
  const numericUserId = typeof userId === 'string' ? parseInt(userId) || 0 : userId;

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
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: { message, userData, persona }
    });

    if (error) {
      console.error("Error getting chat response:", error);
      throw error;
    }

    return data.response;
  } catch (error) {
    console.error("Error in getChatResponse:", error);
    throw error;
  }
};