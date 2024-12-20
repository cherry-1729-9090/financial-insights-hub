import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
  const [messages, setMessages] = useState<{ text: string; isAi: boolean }[]>([
    { text: "Hello! How can I help you with your finances today?", isAi: true }
  ]);

  // Fetch chat history
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChatSession[];
    }
  });

  // Fetch messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages', selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedChat)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedChat
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
    }
  }, [selectedChat, chatMessages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setInputMessage("");
    setMessages(prev => [...prev, { text: message, isAi: false }]);

    try {
      let sessionId = selectedChat;
      
      // Create new chat session if none selected
      if (!sessionId) {
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          }])
          .select()
          .single();
        
        if (sessionError) throw sessionError;
        sessionId = session.id;
        setSelectedChat(sessionId);
      }

      // Save user message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: message,
          role: 'user'
        }]);

      if (messageError) throw messageError;

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt: message }
      });

      if (error) throw error;

      const aiResponse = data?.generatedText || "I apologize, but I couldn't process your request at this time.";
      
      // Save AI response
      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: aiResponse,
          role: 'assistant'
        }]);

      setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
    }
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setMessages([{ text: "How can I help you with your finances today?", isAi: true }]);
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
        <div className="p-3 border-b flex items-center bg-white/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">AI Financial Advisor</h1>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
          ))}
        </div>

        <div className="p-3 border-t bg-white/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your financial question..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputMessage);
                }
              }}
            />
            <Button 
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;