import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: string;
  created_at: string;
}

export const useChat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; isAi: boolean }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      console.log('Checking user authentication...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found, redirecting to login...');
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }
      console.log('User authenticated:', user.id);
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  // Fetch chat history
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory', userId],
    queryFn: async () => {
      console.log('Fetching chat history for user:', userId);
      if (!userId) return [];
      
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
      return data as ChatSession[];
    },
    enabled: !!userId
  });

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !userId) return;
      
      console.log('Fetching messages for chat:', selectedChat);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedChat)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching chat messages:', error);
        toast.error("Failed to load chat messages");
        return;
      }

      console.log('Chat messages fetched:', data);
      const formattedMessages = data.map(msg => ({
        text: msg.content,
        isAi: msg.role === 'assistant'
      }));
      
      setMessages(formattedMessages);
      setShowSuggestions(false);
    };

    fetchMessages();
  }, [selectedChat, userId]);

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !userId) {
      console.log('Invalid message or no user ID');
      return;
    }
    
    console.log('Sending message:', message);
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    setShowSuggestions(false);

    try {
      let sessionId = selectedChat;
      
      // Create new chat session if none selected
      if (!sessionId) {
        console.log('Creating new chat session...');
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
        sessionId = session.id;
        setSelectedChat(sessionId);
        console.log('New chat session created:', sessionId);
      }

      // Save user message
      console.log('Saving user message to database...');
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: message,
          role: 'user',
          user_id: userId
        }]);

      if (messageError) {
        console.error('Failed to save message:', messageError);
        toast.error("Failed to save message");
        throw messageError;
      }

      // Get AI response
      console.log('Requesting AI response...');
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt: message }
      });

      if (error) {
        console.error('Failed to get AI response:', error);
        toast.error("Failed to get AI response. Please try again.");
        throw error;
      }

      console.log('AI response received:', data);
      const aiResponse = data?.generatedText || "I apologize, but I couldn't process your request at this time.";
      
      // Save AI response
      console.log('Saving AI response to database...');
      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: aiResponse,
          role: 'assistant',
          user_id: userId
        }]);

      setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
      console.log('Message exchange completed successfully');
    } catch (error) {
      console.error("Error in message handling:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    console.log('Starting new chat...');
    setSelectedChat(null);
    setMessages([]);
    setShowSuggestions(true);
  };

  return {
    messages,
    chatHistory,
    selectedChat,
    showSuggestions,
    handleSendMessage,
    handleNewChat,
    setSelectedChat,
  };
};