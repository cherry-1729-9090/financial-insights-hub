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

      // Get AI response with streaming
      console.log('Requesting AI response...');
      const response = await fetch(`${supabase.functions.url}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({ prompt: message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          try {
            const data = JSON.parse(chunk);
            if (data.content) {
              aiResponse += data.content;
              // Update UI with streamed response
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.isAi) {
                  lastMessage.text = aiResponse;
                  return newMessages;
                } else {
                  return [...prev, { text: aiResponse, isAi: true }];
                }
              });
            }
          } catch (e) {
            console.log('Chunk processing error:', e);
          }
        }
      }

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