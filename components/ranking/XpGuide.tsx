'use client';

import {
  CheckCircle2,
  ChevronDown,
  Flame,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { XP_RULES, type XpRule } from '@/lib/xp-rewards';
import { cn } from '@/lib/utils';

const ruleStyles: Record<
  XpRule['id'],
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }
> = {
  correct: {
    icon: CheckCircle2,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  pass: {
    icon: Trophy,
    iconBg: 'bg-emerald-400/15',
    iconColor: 'text-emerald-400',
  },
  daily: {
    icon: Flame,
    iconBg: 'bg-orange-400/15',
    iconColor: 'text-orange-400',
  },
  'answer-streak': {
    icon: Sparkles,
    iconBg: 'bg-violet-400/15',
    iconColor: 'text-violet-400',
  },
};

export function XpGuide() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors',
        expanded && 'border-primary/30'
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 bg-primary/5 px-4 py-4 text-left transition-colors hover:bg-primary/10"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
          <Zap className="size-5 fill-primary/20 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="section-title">Πώς μαζεύεις XP</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Κάνε τεστ, κράτα σερί και ανέβα στην κατάταξη
          </p>
        </div>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <ul className="divide-y divide-border/40 border-t border-border/40">
          {XP_RULES.map((rule) => {
            const { icon: Icon, iconBg, iconColor } = ruleStyles[rule.id];

            return (
              <li key={rule.id} className="flex items-center gap-4 px-4 py-4">
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                    iconBg
                  )}
                >
                  <Icon className={cn('size-5', iconColor)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold leading-tight">{rule.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-extrabold tabular-nums text-primary">
                  {rule.xpLabel} XP
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
