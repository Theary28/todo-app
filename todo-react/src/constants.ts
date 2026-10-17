import { Circle, CircleCheck, CircleDot, type LucideIcon } from 'lucide-react'
import type { Status } from './types'

export const STATUSES: Status[] = ['To Do', 'In Progress', 'Done']

export const STATUS_META: Record<
  Status,
  { icon: LucideIcon; next: Status; iconClass: string; pill: string; tint: string; dot: string }
> = {
  'To Do': {
    icon: Circle,
    next: 'In Progress',
    iconClass: 'text-slate-400',
    pill: 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300',
    tint: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  'In Progress': {
    icon: CircleDot,
    next: 'Done',
    iconClass: 'text-amber-500',
    pill: 'bg-amber-500/15 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
    tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  Done: {
    icon: CircleCheck,
    next: 'To Do',
    iconClass: 'text-emerald-500 fill-emerald-500/15',
    pill: 'bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
