import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message: string) => void;
}

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage }: ChatInputProps) => {
  const onSendMessage = () => {
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your financial question..."
          className="flex-1 bg-white/80 backdrop-blur-sm border-blue-100 focus-visible:ring-primary"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage();
            }
          }}
        />
        <Button 
          onClick={onSendMessage}
          disabled={!inputMessage.trim()}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;