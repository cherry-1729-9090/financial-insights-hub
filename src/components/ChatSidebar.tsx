import { Button } from "@/components/ui/button";

interface ChatHistory {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  history: ChatHistory[];
  onSelectChat: (id: string) => void;
  selectedChat?: string;
}

const ChatSidebar = ({ history, onSelectChat, selectedChat }: ChatSidebarProps) => {
  return (
    <div className="w-64 bg-gray-50 p-4 border-r h-screen">
      <h2 className="text-lg font-semibold mb-4">Chat History</h2>
      <div className="space-y-2">
        {history.map((chat) => (
          <Button
            key={chat.id}
            variant={selectedChat === chat.id ? "secondary" : "ghost"}
            className="w-full justify-start text-left"
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;