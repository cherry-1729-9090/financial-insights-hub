import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatHistory = (userId: string | null) => {
  const queryClient = useQueryClient();
  const queryKey = ['chatHistory', userId];
  console.log('[userId]', userId);
  const { data: chatHistory = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Fetching chat history for user:', userId);
      if (!userId) return [];
      
      try {
        // Convert numeric user ID to UUID format if needed
        const formattedUserId = userId.includes('-') ? userId : '00000000-0000-0000-0000-000000000000';
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', formattedUserId)
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

  const invalidateHistory = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const createChatSession = async (message: string) => {
    console.log('Creating new chat session...');
    try {
      // Convert numeric user ID to UUID format if needed
      const formattedUserId = userId && userId.includes('-') ? 
        userId : '00000000-0000-0000-0000-000000000000';

      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          user_id: formattedUserId
        }])
        .select()
        .single();
      
      if (sessionError) {
        console.error('Failed to create chat session:', sessionError);
        toast.error("Failed to create chat session");
        throw sessionError;
      }
      
      // Invalidate the chat history to refresh the list
      await invalidateHistory();
      
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
    createChatSession,
    invalidateHistory
  };
};