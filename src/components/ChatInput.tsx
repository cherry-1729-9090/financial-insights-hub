import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message: string) => void;
}

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage }: ChatInputProps) => {
  return (
    <div className="p-3 border-t bg-white/50 backdrop-blur-sm">
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your financial question..."
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage(inputMessage);
            }
          }}
        />
        <Button 
          onClick={() => handleSendMessage(inputMessage)}
          disabled={!inputMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;