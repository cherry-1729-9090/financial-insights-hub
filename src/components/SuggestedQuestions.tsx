import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SuggestedQuestions = ({ onSelectQuestion }: SuggestedQuestionsProps) => {
  const questions = [
    "What's my current credit score and how can I improve it?",
    "Can you analyze my loan history and suggest better options?",
    "What are the best credit cards available based on my profile?",
    "How can I better manage my personal loans and debts?"
  ];

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-gray-500 mb-2">Select a question to get started:</p>
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4"
          onClick={() => onSelectQuestion(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;