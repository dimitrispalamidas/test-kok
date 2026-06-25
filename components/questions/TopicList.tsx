'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import type { TopicPracticeStats, TopicWithCount } from '@/actions/topics';
import { getTopicStatsByCategory } from '@/actions/topics';
import { cn } from '@/lib/utils';

type TopicListProps = {
  topics: TopicWithCount[];
  kcod: number;
};

export function TopicList({ topics, kcod }: TopicListProps) {
  const { data: statsByTheme = {} } = useQuery({
    queryKey: ['topic-stats', kcod],
    queryFn: () => getTopicStatsByCategory(kcod),
  });

  if (!topics.length) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Δεν βρέθηκαν θέματα για αυτή την κατηγορία.
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <div
        className="absolute bottom-0 left-3 top-0 w-0.5 bg-primary/30"
        aria-hidden
      />

      {topics.map((topic) => (
        <TopicRow
          key={topic.theme}
          topic={topic}
          kcod={kcod}
          stats={statsByTheme[topic.theme]}
        />
      ))}
    </div>
  );
}

function TopicRow({
  topic,
  kcod,
  stats,
}: {
  topic: TopicWithCount;
  kcod: number;
  stats?: TopicPracticeStats;
}) {
  const correctCount = stats?.correct ?? 0;
  const wrongCount = stats?.wrong ?? 0;

  return (
    <Link
      href={`/practice/${kcod}?theme=${encodeURIComponent(topic.theme)}`}
      className={cn(
        'relative ml-6 flex items-center gap-3 rounded-2xl border border-border/60',
        'bg-card px-4 py-4 transition-colors hover:border-primary/30 hover:bg-accent/30'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="card-title">{topic.theme}</p>
        <p className="card-subtitle">{topic.questionCount} ερωτήσεις</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
          <Check className="size-3" />
          {correctCount}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
          <X className="size-3" />
          {wrongCount}
        </span>
      </div>
    </Link>
  );
}
