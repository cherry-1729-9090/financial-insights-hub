import { useState } from "react";

interface ChatMessage {
  text: string;
  isAi: boolean;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    addMessage
  };
};