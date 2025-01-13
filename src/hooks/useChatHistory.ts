import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatHistory = (payload: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = ['chatHistory', payload];
  // console.log('[payload] in chatHistory', payload);
  const { data: chatHistory = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Fetching chat history for user:', payload);
      if (!payload) return [];
      
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', payload)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[chatHistory] Error fetching chat history:', error);
          throw error;
        }
        console.log('[chatHistory] Chat history fetched:', data);
        return data;
      } catch (error) {
        console.error('[chatHistory] Error fetching chat history:', error);
        toast.error("Failed to fetch chat history");
        return [];
      }
    },
    enabled: !!payload
  });

  const invalidateHistory = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const createChatSession = async (message: string) => {
    console.log('[createChatSession] Creating new chat session...');
    try {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          user_id: payload
        }])
        .select()
        .single();
      
      if (sessionError) {
        console.error('[createChatSession] Failed to create chat session:', sessionError);
        toast.error("Failed to create chat session");
        throw sessionError;
      }
      
      await invalidateHistory();
      
      console.log('[createChatSession] New chat session created:', session.id);
      return session.id;
    } catch (error) {
      console.error('[createChatSession] Error creating chat session:', error);
      toast.error("Failed to create chat session");
      throw error;
    }
  };

  return {
    chatHistory,
    createChatSession,
    invalidateHistory
  };
};