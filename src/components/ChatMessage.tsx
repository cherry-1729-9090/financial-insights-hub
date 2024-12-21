import { MessageCircle, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
}

const ChatMessage = ({ message, isAi = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-lg mb-3",
        isAi ? "bg-gray-50/80 ml-0" : "bg-primary/5 ml-auto",
        isAi ? "max-w-[90%]" : "max-w-[80%]"
      )}
    >
      <div className={cn("shrink-0 mt-1", isAi ? "text-primary" : "text-secondary")}>
        {isAi ? (
          <Bot className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </div>
      <div className="space-y-2 w-full">
        <p className="text-sm font-medium text-gray-700">
          {isAi ? "AI Financial Advisor" : "You"}
        </p>
        <div className="prose prose-sm max-w-none w-full prose-p:leading-relaxed prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-li:my-0.5 prose-ul:my-2">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;