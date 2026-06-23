import type { AnswerVisualState } from '@/components/ui/AnswerOption';
import { AnswerOption } from '@/components/ui/AnswerOption';
import { QuestionImageFromPhoto } from '@/components/ui/QuestionImage';
import type { QuestWithAnswers } from '@/types/database';

type QuestionCardProps = {
  question: QuestWithAnswers;
  questionNumber: number;
  totalQuestions: number;
  selectedAaa: number | null;
  onSelect: (aaa: number) => void;
  disabled?: boolean;
  revealMode?: boolean;
};

function getAnswerState(
  aaa: number,
  selectedAaa: number | null,
  correctAaa: number,
  revealMode: boolean,
  disabled: boolean
): AnswerVisualState {
  if (revealMode) {
    if (aaa === correctAaa) return 'correct';
    if (aaa === selectedAaa && selectedAaa !== correctAaa) return 'wrong';
    return 'disabled';
  }

  if (disabled) {
    if (aaa === selectedAaa) return 'selected';
    return 'disabled';
  }

  if (aaa === selectedAaa) return 'selected';
  return 'neutral';
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAaa,
  onSelect,
  disabled = false,
  revealMode = false,
}: QuestionCardProps) {
  const correctAnswer = question.answers.find((a) => a.acorr);
  const correctAaa = correctAnswer?.aaa ?? 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Ερώτηση {questionNumber} / {totalQuestions}
        </p>
        <h2 className="text-lg font-semibold leading-relaxed">
          {question.qlect}
        </h2>
      </div>

      <QuestionImageFromPhoto
        key={question.qphoto ?? 'no-image'}
        qphoto={question.qphoto}
        alt={question.qlect}
      />

      <div className="space-y-2">
        {question.answers.map((answer, idx) => (
          <AnswerOption
            key={`${question.qcod}-${answer.aaa}`}
            label={answer.alect}
            index={idx + 1}
            state={getAnswerState(
              answer.aaa,
              selectedAaa,
              correctAaa,
              revealMode,
              disabled
            )}
            onSelect={() => onSelect(answer.aaa)}
            disabled={disabled || revealMode}
          />
        ))}
      </div>
    </div>
  );
}
