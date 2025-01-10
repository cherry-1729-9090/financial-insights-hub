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
        "flex gap-2 sm:gap-4 max-w-[90%] sm:max-w-[80%] w-auto p-3 sm:p-4 rounded-lg", 
        isAi ? "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-blue-100" :
         "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm border border-indigo-100"
      )}>
        <div className={cn(
          "shrink-0 mt-1 p-1.5 sm:p-2 h-fit rounded-full",
          isAi ? "bg-primary text-white order-first" : "bg-secondary text-primary order-first"
        )}>
          {isAi ? (
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </div>
        <div className="space-y-1 sm:space-y-2 overflow-hidden flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-700">
            {isAi ? "AI Financial Advisor" : "You"}
          </p>
          <div className="prose prose-xs sm:prose-sm max-w-none w-full break-words whitespace-pre-wrap text-sm sm:text-base [&>p]:leading-normal [&>p]:my-0.5 [&>h1]:mb-1 [&>h1]:mt-2 [&>h2]:mb-1 [&>h2]:mt-2 [&>h3]:mb-1 [&>h3]:mt-2 [&>ul]:my-1 [&>li]:my-0.5 [&>a]:text-primary hover:[&>a]:text-primary/80">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;