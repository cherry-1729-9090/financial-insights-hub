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

const Chat = ({ userData, payload}: any) => {
  console.log('[Chat] [payload]', payload);
  const [inputMessage, setInputMessage] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    setMessages,
    chatHistory,
    selectedChat,
    showSuggestions,
    handleSendMessage: originalHandleSendMessage,
    handleNewChat,
    setSelectedChat,
    handleDeleteChat,
  } = useChat(persona, userData, payload);

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
          scrollToBottom();
        }
      }
    };
    loadChatHistory();
  }, [selectedChat, setMessages]);

  const handleSendMessage = async (message: string) => {
    setIsAiThinking(true);
    try {
      await originalHandleSendMessage(message);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleQuestionSelect = async (question: string) => {
    setInputMessage(""); 
    await handleSendMessage(question);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden relative bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Overlay for mobile when sidebar is open */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative lg:flex h-full z-30 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-80" : "translate-x-0 w-72 sm:w-80"
      )}>
        <ChatSidebar
          history={chatHistory}
          onSelectChat={(id) => {
            setSelectedChat(id);
            if (window.innerWidth < 1024) {
              setIsSidebarCollapsed(true);
            }
          }}
          selectedChat={selectedChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          className="h-full shadow-lg"
        />
      </div>
      
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 -translate-y-1/2 left-2 z-40 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-105 lg:hidden"
      >
        <ChevronLeft className={cn(
          "h-4 w-4 text-primary transition-transform duration-300",
          isSidebarCollapsed ? "rotate-0" : "rotate-180"
        )} />
      </button>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ChatHeader userData={userData} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4">
          <Card className="min-h-full bg-white/50 backdrop-blur-sm border-none shadow-sm">
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 pb-20">
              {showSuggestions && messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="p-2 bg-primary rounded-full">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                      <h2 className="text-base sm:text-2xl font-semibold text-primary">
                        Your Personal Financial AI Advisor
                      </h2>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-sm sm:text-lg text-gray-700 leading-relaxed">
                        👋 Hey {userData?.name || 'there'}, Welcome to Minemi AI!
                      </p>
                      <p className="text-xs sm:text-base text-gray-600">
                        ✨ We see your credit score is <span className="font-semibold">{userData?.credit_score}</span> and 
                        you have <span className="font-semibold">{userData?.running_loan} active loans</span>.
                      </p>
                      <p className="text-xs sm:text-base text-gray-600">
                        Let's explore ways to reduce EMIs, boost your score, or find top-up options.
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-medium">
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
                <div className="space-y-2 sm:space-y-4">
                  {messages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg.text} isAi={msg.isAi} />
                  ))}
                  {isAiThinking && (
                    <div className="flex gap-2 p-4 rounded-lg">
                      <div className="flex gap-4 max-w-[80%] w-auto p-4 rounded-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100">
                        <div className="shrink-0 mt-0.5 p-1.5 h-fit rounded-full bg-primary text-white">
                          <div className="h-3 w-3 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">AI Financial Advisor</p>
                          <div className="flex gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
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