import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ userData }: { userData: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-2.5 sm:p-4 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-blue-50 h-7 w-7 sm:h-9 sm:w-9"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <div>
          <h1 className="text-sm sm:text-lg font-semibold text-primary leading-tight">AI Financial Advisor</h1>
          {userData?.credit_score && (
            <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Credit Score: {userData.credit_score}</p>
          )}
        </div>
      </div>
      
      {userData && (
        <div className="flex gap-1.5 sm:gap-3 text-[10px] sm:text-sm text-gray-600">
          <div className="px-2 py-1 rounded-full bg-blue-100/80 backdrop-blur-sm whitespace-nowrap">
            FOIR: {userData.foir}%
          </div>
          <div className="px-2 py-1 rounded-full bg-green-50/80 backdrop-blur-sm whitespace-nowrap">
            Active: {userData.running_loan}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;