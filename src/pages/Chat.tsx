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
      
      <div className="flex-1 flex flex-col glass-effect shadow-lg overflow-hidden">
        <ChatHeader userData={userData} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <Card className="min-h-full bg-white/50 backdrop-blur-sm border-none shadow-sm">
            <div className="p-4 space-y-4">
              {showSuggestions && messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-blue-50/50 backdrop-blur-sm border border-blue-100">
                    <h2 className="text-2xl font-semibold text-primary mb-3">
                      Welcome to Your AI Financial Advisor
                    </h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      I'm here to help you make informed financial decisions. I can analyze your credit profile, 
                      provide personalized advice, and answer any questions about loans, credit cards, or general 
                      financial planning.
                    </p>
                    <p className="text-gray-600 mb-6">
                      Your current credit score is <span className="font-semibold">{userData?.credit_score}</span>, 
                      and I've prepared some relevant questions based on your financial profile.
                    </p>
                    <div className="max-w-full overflow-hidden">
                      <p className="text-sm text-gray-500 mb-4 font-medium">
                        Here are some questions to get you started:
                      </p>
                      <SuggestedQuestions
                        onSelectQuestion={handleSendMessage}
                        aiGeneratedQuestions={aiQuestions}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

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