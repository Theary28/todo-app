import { useState, type FormEvent, type Ref } from 'react'
import { CornerDownLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUSES, STATUS_META } from '@/constants'
import { cn } from '@/lib/utils'
import type { Status } from '@/types'

interface TodoFormProps {
  onAdd: (title: string, status: Status) => void
  inputRef?: Ref<HTMLInputElement>
}

export default function TodoForm({ onAdd, inputRef }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<Status>(STATUSES[0])
  const [error, setError] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      // Keep the button clickable, but point the user at the empty field
      setError(true)
      e.currentTarget.querySelector('input')?.focus()
      return
    }
    onAdd(trimmed, status)
    setTitle('')
    setStatus(STATUSES[0])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 sm:flex-nowrap',
        error && 'border-destructive/50 ring-4 ring-destructive/10 focus-within:border-destructive/50 focus-within:ring-destructive/10'
      )}
    >
      <div className="flex min-w-0 flex-1 basis-full items-center sm:basis-auto">
        <Plus className={cn('mx-2 size-5 shrink-0 text-muted-foreground', error && 'text-destructive')} />
        <Input
          ref={inputRef}
          className="h-10 border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
          placeholder={error ? 'Type a title first…' : 'What needs to be done?'}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError(false)
          }}
          aria-label="Todo title"
          aria-invalid={error || undefined}
        />
      </div>
      <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
        <SelectTrigger
          className="h-10 flex-1 rounded-xl border-0 bg-muted/70 shadow-none sm:w-40 sm:flex-none"
          aria-label="Status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => {
            const Icon = STATUS_META[s].icon
            return (
              <SelectItem key={s} value={s}>
                <Icon className={STATUS_META[s].iconClass} /> {s}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <Button type="submit" className="h-10 rounded-xl px-4 shadow-md shadow-primary/25">
        Add task
        <CornerDownLeft className="opacity-60" />
      </Button>
    </form>
  )
}
