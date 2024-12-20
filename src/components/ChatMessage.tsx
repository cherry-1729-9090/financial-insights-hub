import { MessageCircle, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
}

const ChatMessage = ({ message, isAi = false }: ChatMessageProps) => {
  return (
    <div
      className={`flex gap-2 p-3 rounded-lg mb-2 max-w-[85%] ${
        isAi ? "bg-gray-50 ml-0" : "bg-primary/5 ml-auto"
      }`}
    >
      <div className={`shrink-0 ${isAi ? "text-primary" : "text-secondary"}`}>
        {isAi ? (
          <Bot className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isAi ? "AI Financial Advisor" : "You"}
        </p>
        <div className="text-sm text-gray-700">{message}</div>
      </div>
    </div>
  );
};

export default ChatMessage;