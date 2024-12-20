import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import { ArrowLeft } from "lucide-react";

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
  const [chatHistory] = useState([
    { id: "1", title: "Credit Card Advice" },
    { id: "2", title: "Loan Management" },
    { id: "3", title: "Credit Score Tips" }
  ]);

  const handleQuestionClick = (question: string) => {
    setMessages(prev => [...prev, 
      { text: question, isAi: false },
      { text: "Thank you for your question. I'm analyzing your financial profile to provide personalized advice...", isAi: true }
    ]);
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar 
        history={chatHistory}
        onSelectChat={(id) => console.log("Selected chat:", id)}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">AI Financial Advisor</h1>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {EXAMPLE_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleQuestionClick(question)}
                className="text-left justify-start"
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