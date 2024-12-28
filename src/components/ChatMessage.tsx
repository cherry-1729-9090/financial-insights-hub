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
        "flex gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-white/50",
        isAi ? "bg-blue-50/50 ml-0" : "bg-indigo-50/50 ml-auto",
        isAi ? "max-w-[90%]" : "max-w-[80%]"
      )}
    >
      <div className={cn(
        "shrink-0 mt-1 p-2 rounded-full",
        isAi ? "bg-primary text-white" : "bg-secondary text-primary"
      )}>
        {isAi ? (
          <Bot className="h-4 w-4" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
      </div>
      <div className="space-y-2 w-full">
        <p className="text-sm font-medium text-gray-700">
          {isAi ? "AI Financial Advisor" : "You"}
        </p>
        <div className="prose prose-sm max-w-none w-full prose-p:leading-relaxed prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-li:my-0.5 prose-ul:my-2 prose-a:text-primary hover:prose-a:text-primary/80">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;