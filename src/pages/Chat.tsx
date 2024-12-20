import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const EXAMPLE_QUESTIONS = [
  "What's the best credit card for my credit score?",
  "How can I improve my credit score?",
  "Should I consolidate my loans?",
  "What's the ideal debt-to-income ratio?"
];

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ text: string; isAi: boolean }[]>([
    { text: "Hello! Choose a question below or ask your own financial question.", isAi: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory] = useState([
    { id: "1", title: "Credit Card Advice", created_at: new Date().toISOString() },
    { id: "2", title: "Loan Management", created_at: new Date().toISOString() },
    { id: "3", title: "Credit Score Tips", created_at: new Date().toISOString() }
  ]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim()) return;
    
    setMessages(prev => [...prev, { text: question, isAi: false }]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt: question }
      });

      if (error) throw error;

      const aiResponse = data?.generatedText || "I apologize, but I couldn't process your request at this time.";
      setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      <ChatSidebar 
        history={chatHistory}
        onSelectChat={(id) => console.log("Selected chat:", id)}
        onNewChat={() => {
          setMessages([{ text: "How can I help you with your finances today?", isAi: true }]);
          setInputMessage("");
        }}
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
          {isLoading && (
            <div className="animate-pulse p-3">
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-white/50 backdrop-blur-sm space-y-3">
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
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLE_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleSendMessage(question)}
                className="text-left justify-start h-auto py-2 px-3 text-sm"
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;