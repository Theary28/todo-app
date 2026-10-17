import { Trash2, X } from 'lucide-react'
import IconTip from '@/components/IconTip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { STATUSES, STATUS_META } from '@/constants'
import type { Status } from '@/types'

interface BulkBarProps {
  count: number
  onDelete: () => void
  onStatus: (status: Status) => void
  onClear: () => void
}

const BAR_BUTTON = 'rounded-full text-background hover:bg-background/15 hover:text-background'

export default function BulkBar({ count, onDelete, onStatus, onClear }: BulkBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div
        className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-foreground py-1.5 pr-1.5 pl-4 text-background shadow-2xl shadow-black/25 duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
        role="toolbar"
        aria-label="Bulk actions"
      >
        <span className="mr-2 text-sm font-semibold whitespace-nowrap">
          <span className="tabular-nums">{count}</span> selected
        </span>
        <span className="mx-1 h-5 w-px bg-background/20" />

        {STATUSES.map((s) => {
          const Icon = STATUS_META[s].icon
          return (
            <IconTip key={s} label={`Move to ${s}`}>
              <Button size="sm" variant="ghost" className={BAR_BUTTON} onClick={() => onStatus(s)}>
                <Icon className={STATUS_META[s].iconClass} />
                <span className="hidden md:inline">{s}</span>
              </Button>
            </IconTip>
          )
        })}

        <span className="mx-1 h-5 w-px bg-background/20" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 /> <span className="hidden sm:inline">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {count} task{count === 1 ? '' : 's'}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The selected tasks will be removed from your list. You can undo this from the
                notification right after.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <IconTip label="Clear selection (Esc)">
          <Button size="icon-sm" variant="ghost" className={BAR_BUTTON} onClick={onClear} aria-label="Clear selection">
            <X />
          </Button>
        </IconTip>
      </div>
    </div>
  )
}
