import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReviewQuestionCardProps = {
  questionNumber: number;
  totalQuestions: number;
  headerAction: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
};

export function ReviewQuestionCard({
  questionNumber,
  totalQuestions,
  headerAction,
  banner,
  children,
}: ReviewQuestionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        <span className="text-sm font-semibold text-muted-foreground">
          Ερώτηση {questionNumber} / {totalQuestions}
        </span>
        {headerAction}
      </div>

      {banner}

      <div className="p-4">{children}</div>
    </div>
  );
}

export function WrongQuestionIcon() {
  return (
    <span
      className={cn(
        'flex size-10 items-center justify-center rounded-xl text-destructive'
      )}
      aria-hidden
    >
      <X className="size-5" />
    </span>
  );
}
