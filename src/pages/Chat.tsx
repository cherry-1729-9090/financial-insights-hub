import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { PersonaType, useChat } from "@/hooks/useChat";
import { generateQuestions } from "@/lib/generateQuestions";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const Chat = ({ userData }: any) => {
  const [inputMessage, setInputMessage] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    setMessages,
    chatHistory,
    selectedChat,
    showSuggestions,
    handleSendMessage,
    handleNewChat,
    setSelectedChat,
  } = useChat(persona);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const { questions, persona } = await generateQuestions(userData);
      setAiQuestions(questions);
      setPersona(persona);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (selectedChat) {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', selectedChat)
          .order('created_at', { ascending: true });
        
        if (data) {
          const formattedMessages = data.map(msg => ({
            text: msg.content,
            isAi: msg.role === 'assistant'
          }));
          setMessages(formattedMessages);
        }
      }
    };
    loadChatHistory();
  }, [selectedChat, setMessages]);

  const handleQuestionSelect = async (question: string) => {
    setInputMessage(""); // Clear input field
    await handleSendMessage(question);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-0" : "w-80"
      )}>
        <ChatSidebar
          history={chatHistory}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          onNewChat={handleNewChat}
          className={cn(
            "transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          )}
        />
      </div>
      
      <div className="flex-1 flex flex-col glass-effect shadow-lg overflow-hidden relative">
        <button
          onClick={toggleSidebar}
          className="absolute left-4 top-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 text-primary transition-transform duration-300",
            isSidebarCollapsed ? "rotate-180" : "rotate-0"
          )} />
        </button>
        
        <ChatHeader userData={userData} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <Card className="min-h-full bg-white/50 backdrop-blur-sm border-none shadow-sm">
            <div className="p-4 space-y-4">
              {showSuggestions && messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary rounded-full">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-primary">
                        Your Personal Financial AI Advisor
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      I specialize in providing personalized financial guidance based on your unique profile. With access to your credit information and financial history, I can help you make informed decisions about:
                    </p>
                    <ul className="list-disc list-inside mb-6 text-gray-600 space-y-2">
                      <li>Credit score improvement strategies</li>
                      <li>Loan and credit card recommendations</li>
                      <li>Debt management advice</li>
                      <li>Financial planning and budgeting</li>
                    </ul>
                    <div className="p-4 bg-blue-100/50 rounded-lg mb-6">
                      <p className="text-primary font-medium">
                        Your Credit Profile Overview:
                      </p>
                      <p className="text-gray-600">
                        Credit Score: <span className="font-semibold">{userData?.credit_score}</span>
                        <span className="mx-2">•</span>
                        FOIR: <span className="font-semibold">{userData?.foir}%</span>
                        <span className="mx-2">•</span>
                        Active Loans: <span className="font-semibold">{userData?.running_loan}</span>
                      </p>
                    </div>
                    <div className="max-w-full overflow-hidden">
                      <p className="text-sm text-gray-500 mb-4 font-medium">
                        Let's start with some personalized questions based on your profile:
                      </p>
                      <SuggestedQuestions
                        onSelectQuestion={handleQuestionSelect}
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
                  <div ref={messagesEndRef} /> {/* Scroll anchor */}
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