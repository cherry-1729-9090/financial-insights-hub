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
      "w-80 bg-gray-50/50 border-r flex flex-col h-full",
      className
    )}>
      <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {history.map((chat) => (
          <Button
            key={chat.id}
            variant={selectedChat === chat.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-left relative group",
              selectedChat === chat.id && "bg-secondary/10 hover:bg-secondary/20"
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
            <div className="truncate flex-1">
              <span className="mr-2">{chat.title}</span>
              {chat.created_at && (
                <span className="text-xs text-muted-foreground">
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