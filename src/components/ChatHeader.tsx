import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-3 border-b flex items-center bg-white/50 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="mr-3"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-lg font-semibold">AI Financial Advisor</h1>
    </div>
  );
};

export default ChatHeader;