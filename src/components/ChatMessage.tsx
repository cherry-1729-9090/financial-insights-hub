import { MessageCircle, Bot, DollarSign } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
}

const ChatMessage = ({ message, isAi = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-2 p-2 sm:p-4 rounded-lg transition-all duration-200 hover:bg-white/50",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex gap-2 sm:gap-4 max-w-[92%] sm:max-w-[80%] w-auto p-2.5 sm:p-4 rounded-lg shadow-sm", 
        isAi 
          ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100" 
          : "bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-100"
      )}>
        <div className={cn(
          "shrink-0 mt-0.5 p-1.5 h-fit rounded-full",
          isAi ? "bg-primary text-white order-first" : "bg-secondary text-primary order-first"
        )}>
          {isAi ? (
            <DollarSign className="h-3 w-3" />
          ) : (
            <MessageCircle className="h-3 w-3" />
          )}
        </div>
        <div className="space-y-1 overflow-hidden flex-1">
          <p className="text-[11px] sm:text-sm font-medium text-gray-700">
            {isAi ? "AI Financial Advisor" : "You"}
          </p>
          <div className="prose prose-sm max-w-none w-full break-words text-[13px] sm:text-base prose-p:leading-relaxed prose-pre:my-0 prose-pre:bg-gray-50 prose-pre:rounded prose-pre:p-2 [&>p]:my-1 [&>ul]:my-1 [&>li]:my-0.5">
            <Markdown>{message}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;