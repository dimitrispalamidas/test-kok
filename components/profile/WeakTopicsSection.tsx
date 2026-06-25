'use client';

import Link from 'next/link';
import type { WeakTopicInsight } from '@/actions/profile-insights';
import { hrefWithCategory } from '@/lib/category-url';
import { cn } from '@/lib/utils';

type WeakTopicsSectionProps = {
  topics: WeakTopicInsight[];
  kcod: number;
};

export function WeakTopicsSection({ topics, kcod }: WeakTopicsSectionProps) {
  const maxWrong = topics[0]?.wrongCount ?? 1;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-4">
        <h2 className="card-title">Θέματα που χρειάζονται δουλειά</h2>
        <p className="card-subtitle">
          Τα περισσότερα λάθη σου αυτή την εβδομάδα — από όλη την εξάσκηση
        </p>
      </div>

      {topics.length === 0 ? (
        <p className="py-4 text-center card-subtitle">
          Καμία ανησυχία — συνέχισε την εξάσκηση!
        </p>
      ) : (
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li key={topic.theme}>
              <Link
                href={hrefWithCategory(
                  `/practice/${kcod}?theme=${encodeURIComponent(topic.theme)}`,
                  kcod
                )}
                className={cn(
                  'block rounded-xl border border-border/50 px-3 py-3',
                  'transition-colors hover:border-primary/30 hover:bg-accent/20'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="card-item-title">{topic.theme}</p>
                  <span className="card-subtitle font-semibold text-destructive">
                    {topic.wrongCount} λάθη
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-destructive/70"
                    style={{
                      width: `${Math.round((topic.wrongCount / maxWrong) * 100)}%`,
                    }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
