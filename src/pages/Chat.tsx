import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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

    // Get the API key from environment
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      toast.error("OpenRouter API key is not set. Please add it in the project settings.");
      setMessages(prev => [...prev, { 
        text: "I apologize, but I need an API key to function. Please add your OpenRouter API key in the project settings.", 
        isAi: true 
      }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Financial Advisor Chat"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: "You are a helpful financial advisor. Provide clear, concise advice based on best financial practices."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response");
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I apologize, but I couldn't process your request at this time.";
      
      setMessages(prev => [...prev, { text: aiResponse, isAi: true }]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please check your API key and try again.");
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm having trouble connecting right now. Please check your API key and try again.", 
        isAi: true 
      }]);
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
        <div className="p-4 border-b flex items-center bg-white/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">AI Financial Advisor</h1>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
          ))}
          {isLoading && (
            <div className="animate-pulse p-4">
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white/50 backdrop-blur-sm space-y-4">
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
                className="text-left justify-start h-auto py-2 px-3"
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