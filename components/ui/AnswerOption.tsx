import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnswerVisualState =
  | 'neutral'
  | 'selected'
  | 'correct'
  | 'wrong'
  | 'disabled';

type AnswerOptionProps = {
  label: string;
  index: number;
  state: AnswerVisualState;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'minimal';
};

const stateStyles: Record<AnswerVisualState, string> = {
  neutral:
    'border border-border/60 bg-card hover:border-primary/40 hover:bg-accent/30',
  selected:
    'border-2 border-primary bg-primary/10 text-foreground ring-1 ring-primary/20',
  correct: 'border-2 border-success bg-success/10 text-success',
  wrong: 'border-2 border-destructive bg-destructive/10 text-destructive',
  disabled: 'border border-border/40 bg-muted/20 opacity-60 cursor-not-allowed',
};

function AnswerBadge({
  index,
  state,
}: {
  index: number;
  state: AnswerVisualState;
}) {
  if (state === 'correct') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-success bg-success text-success-foreground">
        <Check className="size-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === 'wrong') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-white">
        <X className="size-4" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
        state === 'selected' &&
          'border-primary bg-primary text-primary-foreground',
        (state === 'neutral' || state === 'disabled') &&
          'border-muted-foreground/25 bg-muted text-muted-foreground'
      )}
    >
      {index}
    </span>
  );
}

export function AnswerOption({
  label,
  index,
  state,
  onSelect,
  disabled = false,
  variant = 'default',
}: AnswerOptionProps) {
  const isInteractive = !disabled && state !== 'disabled' && onSelect;

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={isInteractive ? onSelect : undefined}
        disabled={disabled || !isInteractive}
        className={cn(
          'w-full rounded-2xl px-5 py-4 text-left text-base font-bold leading-snug transition-all duration-200',
          stateStyles[state],
          isInteractive && 'cursor-pointer active:scale-[0.99]'
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isInteractive ? onSelect : undefined}
      disabled={disabled || !isInteractive}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-base font-semibold transition-all duration-200',
        stateStyles[state],
        isInteractive && 'cursor-pointer active:scale-[0.98]'
      )}
    >
      <AnswerBadge index={index} state={state} />
      <span className="leading-snug">{label}</span>
    </button>
  );
}
