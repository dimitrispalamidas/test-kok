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
};

const stateStyles: Record<AnswerVisualState, string> = {
  neutral:
    'border-border bg-background hover:border-primary/50 hover:bg-accent/50',
  selected: 'border-primary bg-primary/10 ring-2 ring-primary/30',
  correct:
    'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  wrong: 'border-destructive bg-destructive/10 text-destructive',
  disabled: 'border-border bg-muted/30 opacity-60 cursor-not-allowed',
};

export function AnswerOption({
  label,
  index,
  state,
  onSelect,
  disabled = false,
}: AnswerOptionProps) {
  const isInteractive = !disabled && state !== 'disabled' && onSelect;

  return (
    <button
      type="button"
      onClick={isInteractive ? onSelect : undefined}
      disabled={disabled || !isInteractive}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
        stateStyles[state],
        isInteractive && 'cursor-pointer'
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
          state === 'selected' &&
            'border-primary bg-primary text-primary-foreground',
          state === 'correct' && 'border-emerald-500 bg-emerald-500 text-white',
          state === 'wrong' && 'border-destructive bg-destructive text-white',
          (state === 'neutral' || state === 'disabled') &&
            'border-muted-foreground/30 bg-muted text-muted-foreground'
        )}
      >
        {index}
      </span>
      <span className="pt-0.5 leading-relaxed">{label}</span>
    </button>
  );
}
