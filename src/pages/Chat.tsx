import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const {
    messages,
    chatHistory,
    selectedChat,
    showSuggestions,
    handleSendMessage,
    handleNewChat,
    setSelectedChat,
  } = useChat();

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