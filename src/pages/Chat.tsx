import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

const Chat = () => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; isAi: boolean }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  // Fetch chat history
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChatSession[];
    },
    enabled: !!userId
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages', selectedChat],
    queryFn: async () => {
      if (!selectedChat || !userId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedChat)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedChat && !!userId
  });

  // Update messages when chat is selected
  useEffect(() => {
    if (selectedChat && chatMessages.length > 0) {
      setMessages(
        chatMessages.map(msg => ({
          text: msg.content,
          isAi: msg.role === 'assistant'
        }))
      );
      setShowSuggestions(false);
    }
  }, [selectedChat, chatMessages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !userId) return;
    
    setInputMessage("");
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    setShowSuggestions(false);

    try {
      let sessionId = selectedChat;
      
      // Create new chat session if none selected
      if (!sessionId) {
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
            user_id: userId
          }])
          .select()
          .single();
        
        if (sessionError) {
          toast.error("Failed to create chat session");
          throw sessionError;
        }
        sessionId = session.id;
        setSelectedChat(sessionId);
      }

      // Save user message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: message,
          role: 'user',
          user_id: userId
        }]);

      if (messageError) {
        toast.error("Failed to save message");
        throw messageError;
      }

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt: message }
      });

      if (error) {
        toast.error("Failed to get AI response. Please try again.");
        throw error;
      }

      const aiResponse = data?.generatedText || "I apologize, but I couldn't process your request at this time.";
      
      // Save AI response
      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: aiResponse,
          role: 'assistant',
          user_id: userId
        }]);

      setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      <ChatSidebar 
        history={chatHistory}
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader />

        <div className="flex-1 overflow-auto p-4">
          {showSuggestions && messages.length === 0 ? (
            <SuggestedQuestions onSelectQuestion={handleSendMessage} />
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
            ))
          )}
        </div>

        <ChatInput 
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;