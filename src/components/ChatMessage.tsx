import { MessageCircle, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
}

const ChatMessage = ({ message, isAi = false }: ChatMessageProps) => {
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg mb-4 ${
        isAi ? "bg-gray-50" : "bg-primary/5"
      }`}
    >
      <div className={`shrink-0 ${isAi ? "text-primary" : "text-secondary"}`}>
        {isAi ? (
          <Bot className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">
          {isAi ? "AI Financial Advisor" : "You"}
        </p>
        <div className="text-sm text-gray-700">{message}</div>
      </div>
    </div>
  );
};

export default ChatMessage;