'use client';

import { getDateInAthens } from '@/lib/daily-streak';
import { profileInsightBodyClass, profileInsightHeaderClass } from '@/lib/profile-section';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'] as const;

type WeekDay = {
  date: string;
  dayNum: number;
  dayOfWeek: number;
  active: boolean;
  isToday: boolean;
};

type ActivityHeatmapProps = {
  activityDates: string[];
};

function getDayOfWeekMondayFirst(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function buildLastSevenDays(activitySet: Set<string>): WeekDay[] {
  const today = getDateInAthens();
  const [year, month, day] = today.split('-').map(Number);
  const todayDate = new Date(Date.UTC(year, month - 1, day));

  const days: WeekDay[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const current = new Date(todayDate);
    current.setUTCDate(current.getUTCDate() - offset);
    const date = current.toISOString().slice(0, 10);

    days.push({
      date,
      dayNum: current.getUTCDate(),
      dayOfWeek: getDayOfWeekMondayFirst(current),
      active: activitySet.has(date),
      isToday: offset === 0,
    });
  }

  return days;
}

function formatWeekRange(days: WeekDay[]): string {
  const first = days[0]?.date;
  const last = days[6]?.date;
  if (!first || !last) return '';

  const formatter = new Intl.DateTimeFormat('el', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Athens',
  });

  return `${formatter.format(new Date(`${first}T12:00:00`))} – ${formatter.format(new Date(`${last}T12:00:00`))}`;
}

export function ActivityHeatmap({ activityDates }: ActivityHeatmapProps) {
  const activitySet = new Set(activityDates);
  const weekDays = buildLastSevenDays(activitySet);
  const activeThisWeek = weekDays.filter((day) => day.active).length;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <div className={profileInsightHeaderClass}>
        <div>
          <h2 className="card-title">Δραστηριότητα εβδομάδας</h2>
          <p className="card-subtitle">
            {activeThisWeek > 0
              ? `${activeThisWeek} από 7 ημέρες · ${formatWeekRange(weekDays)}`
              : 'Καμία μελέτη τις τελευταίες 7 ημέρες'}
          </p>
        </div>
      </div>

      <div
        className={cn(
          profileInsightBodyClass,
          'flex items-center'
        )}
      >
        <div className="grid w-full grid-cols-7 gap-1.5">
        {weekDays.map((day) => (
          <div key={day.date} className="flex flex-col gap-1.5">
            <span
              className={cn(
                'text-center text-[11px] font-semibold leading-none',
                day.isToday ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {DAY_LABELS[day.dayOfWeek]}
            </span>
            <div
              title={day.active ? 'Μελέτη' : 'Χωρίς μελέτη'}
              className={cn(
                'flex h-11 w-full items-center justify-center rounded-xl text-xs font-bold',
                day.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground',
                day.isToday && 'ring-2 ring-primary/60 ring-offset-1 ring-offset-card'
              )}
            >
              {day.dayNum}
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
