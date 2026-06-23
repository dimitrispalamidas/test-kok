import { cn } from '@/lib/utils';

type ProgressDotsProps = {
  total: number;
  current: number;
  answered: Set<number>;
  onNavigate: (index: number) => void;
};

export function ProgressDots({
  total,
  current,
  answered,
  onNavigate,
}: ProgressDotsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index === current;
        const isAnswered = answered.has(index);

        return (
          <button
            key={index}
            type="button"
            onClick={() => onNavigate(index)}
            aria-label={`Μετάβαση στην ερώτηση ${index + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'size-2.5 rounded-full transition-all duration-200',
              isCurrent &&
                'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background',
              isAnswered && !isCurrent && 'bg-primary',
              !isAnswered &&
                !isCurrent &&
                'bg-muted-foreground/25 hover:bg-primary/40',
              isCurrent && (isAnswered ? 'bg-primary' : 'bg-primary/70')
            )}
          />
        );
      })}
    </div>
  );
}
