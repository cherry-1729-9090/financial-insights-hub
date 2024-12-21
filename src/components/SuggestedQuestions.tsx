import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SuggestedQuestions = ({ onSelectQuestion }: SuggestedQuestionsProps) => {
  // Default questions in case the AI-generated ones aren't ready
  const questions = [
    `Given my credit score of 735, what steps can I take to improve it further?`,
    `I have 21 running loans out of 66 total loans. Is this a healthy ratio?`,
    `What strategies would you recommend for managing my total loan amount of ₹1.39 crores?`,
    `How can I optimize my home loan of ₹77.7 lakhs and personal loan of ₹54.6 lakhs?`
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