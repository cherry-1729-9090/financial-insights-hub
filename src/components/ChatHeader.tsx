import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ userData }: { userData: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-indigo-50/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-blue-50 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-primary">AI Financial Advisor</h1>
          {userData?.credit_score && (
            <p className="text-xs sm:text-sm text-gray-500">Credit Score: {userData.credit_score}</p>
          )}
        </div>
      </div>
      
      {userData && (
        <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
          <div className="px-2 sm:px-3 py-1 rounded-full bg-blue-100">
            FOIR: {userData.foir}%
          </div>
          <div className="px-2 sm:px-3 py-1 rounded-full bg-green-50">
            Active Loans: {userData.running_loan}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;