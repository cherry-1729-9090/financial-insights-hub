import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  aiGeneratedQuestions?: string[] | JSX.Element[];
}

const SuggestedQuestions = ({ onSelectQuestion, aiGeneratedQuestions }: SuggestedQuestionsProps) => {
  const questions = aiGeneratedQuestions?.length > 0 
    ? aiGeneratedQuestions 
    : [
        <Skeleton key={1} className="h-6 w-full" />, 
        <Skeleton key={2} className="h-6 w-full" />, 
        <Skeleton key={3} className="h-6 w-full" />, 
        <Skeleton key={4} className="h-6 w-full" />
      ];

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-gray-500 mb-2">Select a question to get started:</p>
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4 w-full"
          onClick={() => typeof question === 'string' ? onSelectQuestion(question) : null}
        >
          <span className="whitespace-normal break-words text-sm text-wrap-auto">
            {question}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
