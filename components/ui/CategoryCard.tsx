import { BookOpen, Clock, FileQuestion } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoryWithStats } from '@/actions/categories';
import { CATEGORY_LABELS, CATEGORY_SHORT } from '@/lib/constants';
import { getCategoryImageUrl } from '@/lib/images';
import { cn } from '@/lib/utils';

type CategoryCardProps = {
  category: CategoryWithStats;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const label = CATEGORY_LABELS[category.kcod] ?? category.klect;
  const short = CATEGORY_SHORT[category.kcod] ?? String(category.kcod);
  const imageUrl = category.kpict ? getCategoryImageUrl(category.kpict) : null;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card',
        'shadow-sm shadow-primary/5 transition-all duration-300',
        'hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10'
      )}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/8 via-accent/50 to-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.52_0.22_264_/_12%),transparent_55%)]" />
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            width={120}
            height={120}
            unoptimized
            className="relative z-10 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="relative z-10 text-5xl font-bold text-primary/40">
            {short}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="card-title">{label}</h2>
          <p className="card-subtitle mt-1">{category.klect}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
            <FileQuestion className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Ερωτήσεις</dt>
              <dd className="font-semibold tabular-nums">
                {category.questionCount}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">Διάρκεια</dt>
              <dd className="font-semibold tabular-nums">
                {category.ktime} λεπτά
              </dd>
            </div>
          </div>
          <div className="col-span-2 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <dt className="text-xs text-muted-foreground">
                Ερωτήσεις ανά εξέταση
              </dt>
              <dd className="font-semibold tabular-nums">
                {category.examQuestionCount}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <Link
            href={`/exam/${category.kcod}`}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5',
              'bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25',
              'transition-all hover:brightness-110 active:scale-[0.98]'
            )}
          >
            Εξεταστική
          </Link>
          <Link
            href={`/practice/${category.kcod}`}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-xl border border-border px-4 py-2.5',
              'bg-background text-sm font-semibold transition-all',
              'hover:border-primary/30 hover:bg-accent active:scale-[0.98]'
            )}
          >
            Εξάσκηση
          </Link>
        </div>
      </div>
    </article>
  );
}
