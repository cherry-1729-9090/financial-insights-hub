import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ userData }: { userData: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-primary">AI Financial Advisor</h1>
          {userData?.credit_score && (
            <p className="text-sm text-gray-500">Credit Score: {userData.credit_score}</p>
          )}
        </div>
      </div>
      
      {userData && (
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="px-3 py-1 rounded-full bg-blue-50">
            FOIR: {userData.foir}%
          </div>
          <div className="px-3 py-1 rounded-full bg-green-50">
            Active Loans: {userData.running_loan}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;