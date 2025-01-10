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
    <div className="relative p-2 sm:p-4">
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your financial question..."
          className="flex-1 bg-white/80 backdrop-blur-sm border-blue-100 focus-visible:ring-primary text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage();
            }
          }}
        />
        <Button 
          onClick={onSendMessage}
          disabled={!inputMessage.trim()}
          className="bg-primary hover:bg-primary/90 text-white h-auto py-2 px-3 sm:py-3 sm:px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;