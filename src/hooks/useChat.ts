import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatMessages } from "./useChatMessages";
import { useChatHistory } from "./useChatHistory";

// Mock credit profile data
const mockCreditProfile = {
  credit_score: "735",
  total_loan_amt: "13936790",
  total_hl_amt: "7772878",
  total_pl_amt: "5462400",
  all_loan: "66",
  running_loan: "21",
  credit_utilization: "NA",
  lenght_of_credit_history: "NA",
  default_count: "NA",
  late_payments: "NA",
  monthly_income: "NA",
  yearly_income: "NA",
  employement_status: "Others",
  foir: "NA",
  gender: "NA"
};

// Fixed user ID for demo purposes
const DEMO_USER_ID = "demo-user-123";

export const useChat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const { messages, setMessages, addMessage } = useChatMessages();
  const { chatHistory, createChatSession } = useChatHistory(DEMO_USER_ID);

  // Generate initial questions based on credit profile
  useEffect(() => {
    const generateInitialQuestions = async () => {
      if (!showSuggestions) return;

      console.log('Generating initial questions based on credit profile...');
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { 
            prompt: `Based on this credit profile: Credit Score: ${mockCreditProfile.credit_score}, Total Loans: ${mockCreditProfile.all_loan}, Running Loans: ${mockCreditProfile.running_loan}, Total Loan Amount: ${mockCreditProfile.total_loan_amt}. Generate 4 relevant financial questions that would be helpful for the user to ask, focusing on credit management and loan optimization. Format the response as a simple array of 4 questions.`
          }
        });

        if (error) throw error;

        if (data?.content) {
          // Parse the response and update suggested questions
          const questions = JSON.parse(data.content);
          // The questions will be used by the SuggestedQuestions component
          console.log('Generated questions:', questions);
        }
      } catch (error) {
        console.error('Error generating questions:', error);
        toast.error("Failed to generate suggested questions");
      }
    };

    generateInitialQuestions();
  }, [showSuggestions]);

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
    if (!message.trim()) {
      console.log('Invalid message');
      return;
    }
    
    console.log('Sending message:', message);
    addMessage({ text: message, isAi: false });
    setShowSuggestions(false);

    try {
      let sessionId = selectedChat;
      
      if (!sessionId) {
        sessionId = await createChatSession(message);
        setSelectedChat(sessionId);
      }

      console.log('Saving user message to database...');
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: message,
          role: 'user',
          user_id: DEMO_USER_ID
        }]);

      if (messageError) {
        console.error('Failed to save message:', messageError);
        toast.error("Failed to save message");
        throw messageError;
      }

      console.log('Requesting AI response...');
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          prompt: `Given this user's credit profile (Credit Score: ${mockCreditProfile.credit_score}, Total Loans: ${mockCreditProfile.all_loan}, Running Loans: ${mockCreditProfile.running_loan}), please provide a detailed response to their question: ${message}`,
        }
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
      
      addMessage({ text: aiResponse, isAi: true });

      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: aiResponse,
          role: 'assistant',
          user_id: DEMO_USER_ID
        }]);

      console.log('Message exchange completed successfully');
    } catch (error) {
      console.error("Error in message handling:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

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