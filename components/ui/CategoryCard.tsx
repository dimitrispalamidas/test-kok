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
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        'shadow-sm transition-shadow hover:shadow-md'
      )}
    >
      <div className="relative flex h-36 items-center justify-center bg-muted/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            width={120}
            height={120}
            unoptimized
            className="object-contain"
          />
        ) : (
          <span className="text-5xl font-bold text-muted-foreground">
            {short}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{category.klect}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Ερωτήσεις</dt>
            <dd className="font-medium">{category.questionCount}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Διάρκεια εξέτασης</dt>
            <dd className="font-medium">{category.ktime} λεπτά</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Ερωτήσεις ανά εξέταση</dt>
            <dd className="font-medium">{category.examQuestionCount}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          <Link
            href={`/exam/${category.kcod}`}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-md px-4 py-2.5',
              'bg-primary text-sm font-medium text-primary-foreground',
              'transition-opacity hover:opacity-90'
            )}
          >
            Εξεταστική
          </Link>
          <Link
            href={`/practice/${category.kcod}`}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-md border border-border px-4 py-2.5',
              'bg-background text-sm font-medium transition-colors hover:bg-accent'
            )}
          >
            Εξάσκηση
          </Link>
        </div>
      </div>
    </article>
  );
}
