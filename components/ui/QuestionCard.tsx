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
  showProgress?: boolean;
  variant?: 'default' | 'exam';
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
  showProgress = true,
  variant = 'default',
}: QuestionCardProps) {
  const correctAnswer = question.answers.find((a) => a.acorr);
  const correctAaa = correctAnswer?.aaa ?? 0;
  const isExam = variant === 'exam';

  return (
    <div className="space-y-5">
      {!isExam && showProgress && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Ερώτηση {questionNumber} / {totalQuestions}
          </span>
        </div>
      )}

      <QuestionImageFromPhoto
        key={question.qphoto ?? 'no-image'}
        qphoto={question.qphoto}
        alt={question.qlect}
      />

      <h2
        className={
          isExam
            ? 'text-center text-base font-medium leading-relaxed sm:text-lg'
            : 'text-lg font-semibold leading-relaxed sm:text-xl'
        }
      >
        {question.qlect}
      </h2>

      <div className="space-y-2.5">
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
            variant={isExam ? 'minimal' : 'default'}
          />
        ))}
      </div>
    </div>
  );
}
