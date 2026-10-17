import { useState, type KeyboardEvent } from 'react'
import { GripVertical, Pencil, Star, Trash2 } from 'lucide-react'
import IconTip from '@/components/IconTip'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUSES, STATUS_META } from '@/constants'
import { cn } from '@/lib/utils'
import type { Status, Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  selected: boolean
  selectionMode: boolean
  onToggleSelect: (id: string) => void
  onUpdate: (id: string, changes: Partial<Omit<Todo, 'id'>>) => void
  onDelete: (id: string) => void
  onMove: (fromId: string, toId: string) => void
}

// On desktop, secondary controls only appear when the row is hovered or focused
const REVEAL =
  'transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'

export default function TodoItem({
  todo,
  selected,
  selectionMode,
  onToggleSelect,
  onUpdate,
  onDelete,
  onMove,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [dragOver, setDragOver] = useState(false)
  const [dragging, setDragging] = useState(false)
  // Only allow dragging when it starts from the grip handle
  const [draggable, setDraggable] = useState(false)

  const meta = STATUS_META[todo.status]
  const StatusIcon = meta.icon
  const isDone = todo.status === 'Done'

  const startEdit = () => {
    setDraft(todo.title)
    setEditing(true)
  }

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed) onUpdate(todo.id, { title: trimmed })
    setEditing(false)
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <li
      className={cn(
        'group relative flex items-center gap-1.5 rounded-xl border bg-card py-2 pr-2 pl-1 shadow-xs transition-all duration-200 animate-in fade-in-0 slide-in-from-top-1 hover:border-primary/25 hover:shadow-md sm:gap-2.5',
        selected && 'border-primary/40 bg-primary/5 ring-1 ring-primary/20',
        dragging && 'opacity-40'
      )}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', todo.id)
        e.dataTransfer.effectAllowed = 'move'
        setDragging(true)
      }}
      onDragEnd={() => {
        setDraggable(false)
        setDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        onMove(e.dataTransfer.getData('text/plain'), todo.id)
      }}
    >
      {dragOver && !dragging && (
        <span className="absolute inset-x-3 -top-1.25 h-0.5 rounded-full bg-primary" />
      )}

      <span
        className="cursor-grab p-1 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground active:cursor-grabbing"
        title="Drag to reorder"
        data-handle
        onMouseDown={() => setDraggable(true)}
        onMouseUp={() => setDraggable(false)}
      >
        <GripVertical className="size-4" />
      </span>

      <Checkbox
        className={cn(!selectionMode && !selected && REVEAL)}
        checked={selected}
        onCheckedChange={() => onToggleSelect(todo.id)}
        aria-label={`Select "${todo.title}"`}
      />

      <IconTip label={`Mark as ${meta.next}`}>
        <button
          type="button"
          onClick={() => onUpdate(todo.id, { status: meta.next })}
          className="grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-accent"
          aria-label={`Status: ${todo.status}. Mark as ${meta.next}`}
          data-status-toggle
        >
          <StatusIcon
            key={todo.status}
            className={cn('size-5 duration-300 animate-in zoom-in-50', meta.iconClass)}
          />
        </button>
      </IconTip>

      {editing ? (
        <Input
          className="h-8 min-w-0 flex-1"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={save}
          aria-label="Edit title"
        />
      ) : (
        <span
          className={cn(
            'min-w-0 flex-1 cursor-text font-medium wrap-break-word transition-colors',
            isDone && 'text-muted-foreground line-through decoration-muted-foreground/40'
          )}
          onDoubleClick={startEdit}
          data-title
        >
          {todo.title}
        </span>
      )}

      <Select value={todo.status} onValueChange={(v) => onUpdate(todo.id, { status: v as Status })}>
        <SelectTrigger
          size="sm"
          className={cn(
            'hidden h-7! w-34 rounded-full border-0 px-2.5 text-xs font-semibold shadow-none sm:flex',
            meta.pill
          )}
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

      <IconTip label={todo.starred ? 'Remove priority' : 'Mark as priority'}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn('rounded-full', !todo.starred && REVEAL)}
          onClick={() => onUpdate(todo.id, { starred: !todo.starred })}
          aria-pressed={todo.starred}
          aria-label={todo.starred ? 'Unstar' : 'Star'}
          data-star
        >
          <Star
            className={cn(
              'transition-transform',
              todo.starred ? 'scale-110 fill-amber-400 text-amber-500' : 'text-muted-foreground'
            )}
          />
        </Button>
      </IconTip>

      <div className={cn('flex', REVEAL)}>
        {!editing && (
          <IconTip label="Rename">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground"
              onClick={startEdit}
              aria-label="Edit"
            >
              <Pencil />
            </Button>
          </IconTip>
        )}
        <IconTip label="Delete">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete"
          >
            <Trash2 />
          </Button>
        </IconTip>
      </div>
    </li>
  )
}
