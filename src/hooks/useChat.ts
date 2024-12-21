import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChatMessages } from "./useChatMessages";
import { useChatHistory } from "./useChatHistory";

export const useChat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const { messages, setMessages, addMessage } = useChatMessages();
  const { chatHistory, createChatSession } = useChatHistory(userId);

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

  // Load chat messages when selecting a chat
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!selectedChat) {
        setMessages([]);
        return;
      }

      console.log('Loading messages for chat:', selectedChat);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        toast.error("Failed to load chat messages");
        return;
      }

      console.log('Chat messages loaded:', data);
      setMessages(
        data.map(msg => ({
          text: msg.content,
          isAi: msg.role === 'assistant'
        }))
      );
      setShowSuggestions(false);
    };

    loadChatMessages();
  }, [selectedChat, setMessages]);

  // Handle sending messages
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !userId) {
      console.log('Invalid message or no user ID');
      return;
    }
    
    console.log('Sending message:', message);
    addMessage({ text: message, isAi: false });
    setShowSuggestions(false);

    try {
      let sessionId = selectedChat;
      
      // Create new chat session if none selected
      if (!sessionId) {
        sessionId = await createChatSession(message);
        setSelectedChat(sessionId);
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
        console.error('AI response error:', error);
        toast.error("Failed to get AI response");
        throw error;
      }

      if (!data || !data.content) {
        throw new Error('Invalid response format from AI');
      }

      const aiResponse = data.content;
      console.log('AI response received:', aiResponse);
      
      // Update messages with AI response
      addMessage({ text: aiResponse, isAi: true });

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