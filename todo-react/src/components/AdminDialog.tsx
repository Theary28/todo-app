import { useEffect, useState } from 'react'
import { CloudOff, Loader2, RotateCw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { STATUS_META } from '@/constants'
import { cn } from '@/lib/utils'
import * as todoApi from '@/services/todoService'
import type { AdminTodo } from '@/types'

interface AdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Read-only list of every user's todos, for admins
export default function AdminDialog({ open, onOpenChange }: AdminDialogProps) {
  const [todos, setTodos] = useState<AdminTodo[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  const load = async () => {
    setStatus('loading')
    try {
      setTodos(await todoApi.getAllTodosForAdmin())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  // Fetch fresh data every time the dialog opens
  useEffect(() => {
    if (open) load()
  }, [open])

  const ownerCount = new Set(todos.map((t) => t.ownerEmail)).size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>All users' tasks</DialogTitle>
          <DialogDescription>
            {status === 'ready'
              ? `${todos.length} task${todos.length === 1 ? '' : 's'} from ${ownerCount} user${ownerCount === 1 ? '' : 's'}.`
              : 'Every task in the system, visible to admins only.'}
          </DialogDescription>
        </DialogHeader>

        {status === 'loading' ? (
          <div className="grid place-items-center py-12" aria-busy="true" aria-label="Loading tasks">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CloudOff className="size-8 text-destructive" />
            <p className="mt-3 text-sm text-muted-foreground">Couldn't load the tasks.</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={load}>
              <RotateCw /> Try again
            </Button>
          </div>
        ) : todos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="-mx-2 max-h-[60vh] divide-y overflow-y-auto">
            {todos.map((todo) => {
              const meta = STATUS_META[todo.status]
              return (
                <li key={todo.id} className="flex items-center gap-3 px-2 py-2.5">
                  <meta.icon className={cn('size-4 shrink-0', meta.iconClass)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{todo.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{todo.ownerEmail}</p>
                  </div>
                  {todo.starred && (
                    <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" aria-label="Starred" />
                  )}
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', meta.pill)}>
                    {todo.status}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
