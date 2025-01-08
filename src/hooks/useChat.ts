import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatMessages } from "./useChatMessages";
import { useChatHistory } from "./useChatHistory";

export type PersonaType = {
  situation: string;
  goal: string;
  criticalDataPoints: string[];
  prompt?: string;  
};

export const useChat = (persona: PersonaType, userData: any) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { messages, setMessages, addMessage } = useChatMessages();
  const { chatHistory, createChatSession, invalidateHistory } = useChatHistory(userData?.id);
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
      const effectiveUserId = userData?.id || '123e4567-e89b-12d3-a456-426614174000';

      console.log("Sending message with:", {
        sessionId,
        userId: effectiveUserId,
        message
      });

      // Save user message
      const { error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content: message,
          role: 'user',
          user_id: effectiveUserId
        });

      if (userMessageError) {
        console.error("Error saving user message:", userMessageError);
        toast.error("Failed to save message");
        throw userMessageError;
      }

      // Get AI response
      const { data: aiData, error: aiError } = await supabase.functions.invoke('chat', {
        body: {
          prompt: `
          Please consider the following persona and credit profile when answering the user's question:
          Chat history: ${JSON.stringify(context)}
          User's query: ${message}
          User's credit profile: ${JSON.stringify(userData)}
          Persona: ${JSON.stringify(persona)}
          Based on this information, provide personalized financial advice.
          `,
          userData: userData,
          persona: persona
        }
      });

      if (aiError) throw aiError;
      const aiResponse = aiData?.content || "Unable to provide a response at the moment.";

      // Add AI response to UI
      addMessage({ text: aiResponse, isAi: true });

      // Save AI response
      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content: aiResponse,
          role: 'assistant',
          user_id: effectiveUserId
        });

      if (aiMessageError) {
        console.error("Error saving AI message:", aiMessageError);
        toast.error("Failed to save AI response");
        throw aiMessageError;
      }

      // Update context with AI response
      setContext((prevContext) => [...prevContext, aiResponse]);
      
    } catch (error) {
      console.error("Error handling message:", error);
      toast.error("An error occurred. Please try again.");
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
    },
    selectedChat,
    setSelectedChat,
    showSuggestions,
    handleDeleteChat,
  };
};