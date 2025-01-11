import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatMessages } from "./useChatMessages";
import { useChatHistory } from "./useChatHistory";
import { getChatResponse, saveChatMessage } from "@/lib/chatUtils";

export type PersonaType = {
  situation: string;
  goal: string;
  criticalDataPoints: string[];
  prompt?: string;  
};

export const useChat = (persona: PersonaType, userData: any, payload: string) => {
  console.log('[useChat] [payload]', payload);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { messages, setMessages, addMessage } = useChatMessages();
  const { chatHistory, createChatSession, invalidateHistory } = useChatHistory(payload);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [context, setContext] = useState<string[]>([]);

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_chat_cascade', {
        chat_session_id: chatId
      });

      if (error) {
        console.error("Error deleting chat:", error);
        toast.error("Failed to delete chat");
        throw error;
      }

      if (selectedChat === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }

      await invalidateHistory();
      toast.success("Chat deleted successfully");

    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
      throw error;
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      // Add user message to UI immediately
      addMessage({ text: message, isAi: false });
      setShowSuggestions(false);

      // Create new chat session if needed
      let sessionId = selectedChat;
      if (!sessionId) {
        sessionId = await createChatSession(message);
        setSelectedChat(sessionId);
      }

      // Update context
      setContext((prevContext) => [...prevContext, message]);

      // Use a demo user ID if no authenticated user
      const effectiveUserId = userData?.id || '0';

      // Save user message
      await saveChatMessage(sessionId, message, 'user', payload);
      console.log('[useChat] [saveChatMessage] [payload]', payload);
      // Get AI response using our utility function
      const aiResponse = await getChatResponse(message, userData, persona);

      // Add AI response to UI
      addMessage({ text: aiResponse, isAi: true });

      // Save AI response
      await saveChatMessage(sessionId, aiResponse, 'assistant', payload);

      // Update context with AI response
      setContext((prevContext) => [...prevContext, aiResponse]);
      
    } catch (error) {
      console.error("Error handling message:", error);
      toast.error("An error occurred. Please try again.");
      
      // Add a fallback message to the UI even if there's an error
      addMessage({ 
        text: "I apologize, but I'm having trouble processing your request. Please try again or rephrase your question.", 
        isAi: true 
      });
    }
  };

  return {
    messages,
    setMessages,
    chatHistory,
    handleSendMessage,
    handleNewChat: () => {
      setSelectedChat(null);
      setContext([]);
      window.location.reload();
    },
    selectedChat,
    setSelectedChat,
    showSuggestions,
    handleDeleteChat,
  };
};