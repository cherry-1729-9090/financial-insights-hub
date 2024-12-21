import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatHistory = (userId: string | null) => {
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory', userId],
    queryFn: async () => {
      console.log('Fetching chat history for user:', userId);
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching chat history:', error);
          throw error;
        }
        console.log('Chat history fetched:', data);
        return data;
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error("Failed to fetch chat history");
        return [];
      }
    },
    enabled: !!userId
  });

  const createChatSession = async (message: string) => {
    console.log('Creating new chat session...');
    try {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          user_id: userId
        }])
        .select()
        .single();
      
      if (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        toast.error("Failed to create chat session");
        throw sessionError;
      }
      
      console.log('New chat session created:', session.id);
      return session.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error("Failed to create chat session");
      throw error;
    }
  };

  return {
    chatHistory,
    createChatSession
  };
};