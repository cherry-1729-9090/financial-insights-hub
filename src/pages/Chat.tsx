import { useState, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { PersonaType, useChat } from "@/hooks/useChat";
import { generateQuestions } from "@/lib/generateQuestions";
import { Card } from "@/components/ui/card";

const Chat = ({ userData }: any) => {
  const [inputMessage, setInputMessage] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [persona, setPersona] = useState<PersonaType | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { questions, persona } = await generateQuestions(userData);
      setAiQuestions(questions);
      setPersona(persona);
    };
    fetchQuestions();
  }, []);

  const {
    messages,
    chatHistory,
    selectedChat,
    showSuggestions,
    handleSendMessage,
    handleNewChat,
    setSelectedChat,
  } = useChat(persona);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        history={chatHistory}
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm shadow-lg">
        <ChatHeader userData={userData} />

        <Card className="flex-1 overflow-auto p-4 m-4 bg-white/50 backdrop-blur-sm border-none shadow-sm">
          {showSuggestions && messages.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50/50 backdrop-blur-sm border border-blue-100">
                <h2 className="text-lg font-semibold text-primary mb-2">
                  Welcome to Your AI Financial Advisor
                </h2>
                <p className="text-gray-600 mb-4">
                  Based on your profile, here are some questions you might find helpful:
                </p>
                <SuggestedQuestions
                  onSelectQuestion={handleSendMessage}
                  aiGeneratedQuestions={aiQuestions}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
              ))}
            </div>
          )}
        </Card>

        <div className="p-4">
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;