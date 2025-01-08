import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatMessages } from "./useChatMessages";
import { useChatHistory } from "./useChatHistory";

const DEMO_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

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
  const { chatHistory, createChatSession } = useChatHistory(DEMO_USER_ID);
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

      // If the deleted chat was selected, clear the selection
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }

      toast.success("Chat deleted successfully");

    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
      throw error;
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    addMessage({ text: message, isAi: false });
    setShowSuggestions(false);

    try {
      let sessionId = selectedChat;
      if (!sessionId) {
        sessionId = await createChatSession(message);
        setSelectedChat(sessionId);
      }

      setContext((prevContext) => [...prevContext, message]);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          prompt: `
          Please consider the following persona and credit profile when answering the user's question:
          Persona: ${persona?.situation}, 
          Goal: ${persona?.goal}, Credit Profile: ${JSON.stringify(userData)}, 
          Context: ${context.join(' ')}, User Question: ${message}
          Most critical data points: ${persona?.criticalDataPoints.join(', ')}
          Now considering all the above information, as you are the best financial advisor, answer the user's question. 
          And also please consider this is the user's profile : ${JSON.stringify(userData)}          
          `
        }
      });

      if (error) throw error;
      const aiResponse = data?.content || "Unable to provide a response at the moment.";

      addMessage({ text: aiResponse, isAi: true });

      await supabase.from('chat_messages').insert([
        { session_id: sessionId, content: aiResponse, role: 'assistant', user_id: DEMO_USER_ID }
      ]);

      setContext((prevContext) => [...prevContext, aiResponse]);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error handling message:", error);
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