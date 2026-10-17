import { Mail, Pencil, RotateCw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { STATUSES, STATUS_META, initials } from '@/constants'
import { cn } from '@/lib/utils'
import type { Profile, StatusCounts } from '@/types'

interface ProfileCardProps {
  profile: Profile
  status: 'loading' | 'error' | 'ready'
  counts: StatusCounts
  onEdit: () => void
  onRetry: () => void
}

function ProgressRing({ value }: { value: number }) {
  const r = 38
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 96 96" className="size-full -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-xl font-bold tabular-nums">{value}%</div>
          <div className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            done
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileCard({ profile, status, counts, onEdit, onRetry }: ProfileCardProps) {
  const donePct = counts.All ? Math.round((counts.Done / counts.All) * 100) : 0

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="relative h-24 bg-linear-to-br from-violet-500 via-fuchsia-500 to-orange-400">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.35),transparent_50%)]" />
      </div>

      <div className="px-5 pb-5">
        <Avatar className="-mt-10 size-20 ring-4 ring-card">
          <AvatarFallback className="bg-linear-to-br from-violet-600 to-fuchsia-500 text-2xl font-bold text-white">
            {status === 'ready' ? initials(profile.displayName) : ''}
          </AvatarFallback>
        </Avatar>

        {status === 'loading' && (
          <div className="mt-4 space-y-2.5" aria-busy="true" aria-label="Loading profile">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-4 w-44 animate-pulse rounded bg-muted" />
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4">
            <h3 className="font-semibold">Couldn't load your profile</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Check that the backend is running, then try again.
            </p>
            <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={onRetry}>
              <RotateCw /> Try again
            </Button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="mt-3">
              <h3 className="truncate text-lg font-bold">{profile.displayName}</h3>
              <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
            </div>

            <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span className="truncate text-foreground">{profile.email || '—'}</span>
            </div>

            <Button variant="outline" className="mt-5 w-full rounded-xl" onClick={onEdit}>
              <Pencil /> Edit profile
            </Button>
          </>
        )}
      </div>

      <Separator />

      <div className="flex items-center gap-5 p-5">
        <ProgressRing value={donePct} />
        <div className="flex-1 space-y-2 text-sm">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', STATUS_META[s].dot)} />
              <span className="text-muted-foreground">{s}</span>
              <span className="ml-auto font-semibold tabular-nums">{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
