import type { WrongQuestWithAnswers } from '@/actions/questions';
import {
  ReviewQuestionCard,
  WrongQuestionIcon,
} from '@/components/questions/ReviewQuestionCard';
import { QuestionCard } from '@/components/ui/QuestionCard';

type WrongQuestionCardProps = {
  question: WrongQuestWithAnswers;
  questionNumber: number;
  totalQuestions: number;
};

export function WrongQuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: WrongQuestionCardProps) {
  return (
    <ReviewQuestionCard
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      headerAction={<WrongQuestionIcon />}
    >
      <QuestionCard
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        selectedAaa={question.selectedAaa}
        onSelect={() => {}}
        revealMode
        disabled
        showProgress={false}
      />
    </ReviewQuestionCard>
  );
}
