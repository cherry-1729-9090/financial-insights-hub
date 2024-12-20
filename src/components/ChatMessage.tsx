interface ChatMessageProps {
  message: string;
  isAi?: boolean;
}

const ChatMessage = ({ message, isAi = false }: ChatMessageProps) => {
  return (
    <div
      className={`p-4 rounded-lg mb-4 ${
        isAi ? "bg-gray-100" : "bg-primary text-white"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-1">{message}</div>
      </div>
    </div>
  );
};

export default ChatMessage;