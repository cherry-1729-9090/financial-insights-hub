import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatHistory {
  id: string;
  title: string;
  created_at?: string;
}

interface ChatSidebarProps {
  history: ChatHistory[];
  onSelectChat: (id: string) => void;
  selectedChat?: string | null;
  onNewChat?: () => void;
  className?: string;
}

const ChatSidebar = ({ 
  history, 
  onSelectChat, 
  selectedChat,
  onNewChat,
  className 
}: ChatSidebarProps) => {
  return (
    <div className={cn(
      "w-80 sidebar-gradient border-r flex flex-col h-full shadow-lg",
      className
    )}>
      <div className="p-4 glass-effect border-b">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 bg-white/50 hover:bg-white/80 transition-all duration-200"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 custom-scrollbar p-3 space-y-2">
        {history.map((chat) => (
          <Button
            key={chat.id}
            variant={selectedChat === chat.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-left relative group transition-all duration-200",
              selectedChat === chat.id 
                ? "bg-blue-100/80 hover:bg-blue-200/80 text-primary shadow-sm" 
                : "hover:bg-white/60 bg-[#F1F0FB]/50",
              "rounded-lg backdrop-blur-sm"
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageSquare className={cn(
              "h-4 w-4 mr-2 shrink-0",
              selectedChat === chat.id ? "text-primary" : "text-gray-500"
            )} />
            <div className="truncate flex-1">
              <span className="mr-2 font-medium">{chat.title}</span>
              {chat.created_at && (
                <span className="text-xs text-gray-500">
                  {format(new Date(chat.created_at), 'MMM d')}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;