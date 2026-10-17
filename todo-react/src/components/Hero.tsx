import { ListTodo, Sparkles, type LucideIcon } from 'lucide-react'
import { STATUSES, STATUS_META } from '@/constants'
import { cn } from '@/lib/utils'
import type { Profile, StatusCounts, StatusFilter } from '@/types'

interface HeroProps {
  profile: Profile
  counts: StatusCounts
  statusFilter: StatusFilter
  onStatusFilter: (filter: StatusFilter) => void
}

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const STAT_CARDS: { key: StatusFilter; label: string; icon: LucideIcon; tint: string }[] = [
  { key: 'All', label: 'All tasks', icon: ListTodo, tint: 'bg-primary/10 text-primary' },
  ...STATUSES.map((s) => ({ key: s, label: s, icon: STATUS_META[s].icon, tint: STATUS_META[s].tint })),
]

export default function Hero({ profile, counts, statusFilter, onStatusFilter }: HeroProps) {
  const firstName = profile.displayName.split(' ')[0] || profile.username
  const remaining = counts.All - counts.Done
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <section>
      <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <Sparkles className="size-4" /> {today}
      </p>
      <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {greeting()}
        {firstName && `, ${firstName}`} <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_1]">👋</span>
      </h2>
      <p className="mt-2 text-muted-foreground">
        {counts.All === 0
          ? 'Your list is empty. Add a task to get started.'
          : remaining === 0
            ? 'All caught up. Every task is done! 🎉'
            : `You have ${remaining} task${remaining === 1 ? '' : 's'} left to finish.`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, tint }) => {
          const active = statusFilter === key
          return (
            <button
              key={key}
              onClick={() => onStatusFilter(key)}
              aria-pressed={active}
              className={cn(
                'group rounded-2xl border bg-card/80 p-4 text-left shadow-xs backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                active && 'border-transparent shadow-md ring-2 ring-primary'
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('grid size-9 place-items-center rounded-xl', tint)}>
                  <Icon className="size-[18px]" />
                </span>
                {active && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Showing
                  </span>
                )}
              </div>
              <div className="mt-3 text-3xl font-bold tabular-nums">{counts[key]}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
