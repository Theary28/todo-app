import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudOff, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import BulkBar from '@/components/BulkBar'
import EmptyState from '@/components/EmptyState'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProfileCard from '@/components/ProfileCard'
import ProfileDialog from '@/components/ProfileDialog'
import TodoForm from '@/components/TodoForm'
import TodoItem from '@/components/TodoItem'
import Toolbar from '@/components/Toolbar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import * as profileApi from '@/services/profileService'
import * as todoApi from '@/services/todoService'
import type { Profile, Status, StatusCounts, StatusFilter, Todo } from '@/types'

type Removed = { todo: Todo; index: number }

const BACKEND_HINT = 'Check that the backend is running on http://localhost:3000.'
const SAVE_FAILED = 'The server could not save it, so nothing was changed.'

export default function App() {
  const [profile, setProfile] = useState<Profile>({ username: '', displayName: '', email: '' })
  const [profileStatus, setProfileStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [profileOpen, setProfileOpen] = useState(false)

  const composerRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // ---------- Keyboard shortcuts: "/" search, "N" new task, Esc clear selection ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [role="dialog"], [role="alertdialog"]')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault()
        composerRef.current?.focus()
      } else if (e.key === 'Escape') {
        setSelected(new Set())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---------- Load from the API ----------
  const loadTodos = async () => {
    setLoading(true)
    setLoadFailed(false)
    try {
      const list = await todoApi.getTodos()
      // The API returns oldest first; show the newest at the top like new tasks
      setTodos(list.reverse())
    } catch {
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    setProfileStatus('loading')
    try {
      setProfile(await profileApi.getProfile())
      setProfileStatus('ready')
    } catch {
      setProfileStatus('error')
    }
  }

  useEffect(() => {
    loadTodos()
    loadProfile()
  }, [])

  // Errors are shown inside the profile dialog, so let them reach it
  const saveProfile = async (changes: Partial<Profile>) => {
    const saved = await profileApi.updateProfile(changes)
    setProfile(saved)
    toast.success('Profile updated')
  }

  // ---------- CRUD ----------
  const addTodo = async (title: string, status: Status) => {
    try {
      const created = await todoApi.createTodo(title, status)
      setTodos((prev) => [created, ...prev])
    } catch {
      toast.error('Could not add the task', { description: SAVE_FAILED })
    }
  }

  // Update the screen right away, then put it back if the API call fails
  const updateTodo = async (id: string, changes: Partial<Omit<Todo, 'id'>>) => {
    const before = todos.find((t) => t.id === id)
    if (!before) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)))
    try {
      await todoApi.updateTodo(id, changes)
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? before : t)))
      toast.error('Could not save your change', { description: SAVE_FAILED })
    }
  }

  // Put deleted todos back where they were
  const restore = (items: Removed[]) =>
    setTodos((prev) => {
      const next = [...prev]
      ;[...items]
        .sort((a, b) => a.index - b.index)
        .forEach(({ todo, index }) => next.splice(Math.min(index, next.length), 0, todo))
      return next
    })

  // Undo re-creates the deleted todos on the server (they get new ids)
  const undoDelete = async (items: Removed[]) => {
    const results = await Promise.allSettled(
      items.map(({ todo }) => todoApi.createTodo(todo.title, todo.status, todo.starred))
    )
    const recreated: Removed[] = []
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') recreated.push({ ...items[i], todo: r.value })
    })
    restore(recreated)
    if (recreated.length < items.length) {
      toast.error('Could not restore every task', { description: SAVE_FAILED })
    }
  }

  const removeTodos = async (ids: Set<string>) => {
    const removed: Removed[] = todos
      .map((todo, index) => ({ todo, index }))
      .filter(({ todo }) => ids.has(todo.id))
    if (removed.length === 0) return
    setTodos((prev) => prev.filter((t) => !ids.has(t.id)))
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))))

    const results = await Promise.allSettled(removed.map(({ todo }) => todoApi.deleteTodo(todo.id)))
    const failed = removed.filter((_, i) => results[i].status === 'rejected')
    const deleted = removed.filter((_, i) => results[i].status === 'fulfilled')

    if (failed.length > 0) {
      restore(failed)
      toast.error(
        failed.length === 1 ? 'Could not delete the task' : `Could not delete ${failed.length} tasks`,
        { description: SAVE_FAILED }
      )
    }
    if (deleted.length > 0) {
      toast(deleted.length === 1 ? 'Task deleted' : `${deleted.length} tasks deleted`, {
        description: deleted.length === 1 ? deleted[0].todo.title : undefined,
        action: { label: 'Undo', onClick: () => undoDelete(deleted) },
      })
    }
  }

  const deleteTodo = (id: string) => removeTodos(new Set([id]))

  // ---------- Bulk actions ----------
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const bulkDelete = () => removeTodos(selected)

  const bulkStatus = async (status: Status) => {
    const targets = todos.filter((t) => selected.has(t.id))
    setTodos((prev) => prev.map((t) => (selected.has(t.id) ? { ...t, status } : t)))
    setSelected(new Set())

    const results = await Promise.allSettled(
      targets.map((t) => todoApi.updateTodo(t.id, { status }))
    )
    const failed = targets.filter((_, i) => results[i].status === 'rejected')
    if (failed.length > 0) {
      // Put the ones that failed back to their old status
      const original = new Map(failed.map((t) => [t.id, t]))
      setTodos((prev) => prev.map((t) => original.get(t.id) ?? t))
      toast.error(`Could not update ${failed.length} of ${targets.length} tasks`, {
        description: SAVE_FAILED,
      })
    } else {
      toast.success(`${targets.length} task${targets.length === 1 ? '' : 's'} moved to ${status}`)
    }
  }

  // ---------- Drag & drop reorder (screen only: the API has no order field yet) ----------
  const moveTodo = (fromId: string, toId: string) =>
    setTodos((prev) => {
      const from = prev.findIndex((t) => t.id === fromId)
      const to = prev.findIndex((t) => t.id === toId)
      if (from < 0 || to < 0 || from === to) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })

  // ---------- Derived data ----------
  const visibleTodos = useMemo(() => {
    const q = search.trim().toLowerCase()
    return todos.filter(
      (t) =>
        (statusFilter === 'All' || t.status === statusFilter) &&
        (!starredOnly || t.starred) &&
        t.title.toLowerCase().includes(q)
    )
  }, [todos, statusFilter, search, starredOnly])

  const counts = useMemo<StatusCounts>(() => {
    const c: StatusCounts = { All: todos.length, 'To Do': 0, 'In Progress': 0, Done: 0 }
    todos.forEach((t) => c[t.status]++)
    return c
  }, [todos])

  const starredCount = todos.filter((t) => t.starred).length
  const isFiltered = statusFilter !== 'All' || starredOnly || search.trim() !== ''

  const clearFilters = () => {
    setStatusFilter('All')
    setStarredOnly(false)
    setSearch('')
  }

  const allVisibleSelected =
    visibleTodos.length > 0 && visibleTodos.every((t) => selected.has(t.id))

  const toggleSelectAll = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      visibleTodos.forEach((t) => (allVisibleSelected ? next.delete(t.id) : next.add(t.id)))
      return next
    })

  return (
    <div className="min-h-screen">
      <Header
        profile={profile}
        onProfileClick={() => profileStatus === 'ready' && setProfileOpen(true)}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pt-8 pb-32 sm:px-6">
        <Hero
          profile={profile}
          counts={counts}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
          <section className="flex min-w-0 flex-col gap-4">
            <TodoForm onAdd={addTodo} inputRef={composerRef} />

            <Toolbar
              search={search}
              onSearch={setSearch}
              starredOnly={starredOnly}
              onStarredOnly={setStarredOnly}
              starredCount={starredCount}
              searchRef={searchRef}
            />

            <div className="flex items-center justify-between px-1 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allVisibleSelected}
                  onCheckedChange={toggleSelectAll}
                  disabled={visibleTodos.length === 0}
                />
                <Label htmlFor="select-all" className="font-normal text-muted-foreground">
                  Select all
                </Label>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
                <span>
                  {visibleTodos.length} of {todos.length} tasks
                </span>
              </div>
            </div>

            {loading ? (
              <ul className="flex flex-col gap-2" aria-busy="true" aria-label="Loading tasks">
                {Array.from({ length: 4 }, (_, i) => (
                  <li key={i} className="h-13 animate-pulse rounded-xl border bg-card" />
                ))}
              </ul>
            ) : loadFailed ? (
              <div className="flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
                <CloudOff className="size-8 text-destructive" />
                <h3 className="mt-3 font-semibold">Couldn't load your tasks</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">{BACKEND_HINT}</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={loadTodos}>
                  <RotateCw /> Try again
                </Button>
              </div>
            ) : visibleTodos.length === 0 ? (
              <EmptyState filtered={todos.length > 0} onClearFilters={clearFilters} />
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    selected={selected.has(todo.id)}
                    selectionMode={selected.size > 0}
                    onToggleSelect={toggleSelect}
                    onUpdate={updateTodo}
                    onDelete={deleteTodo}
                    onMove={moveTodo}
                  />
                ))}
              </ul>
            )}

           
          </section>

          <aside className="lg:sticky lg:top-24">
            <ProfileCard
              profile={profile}
              status={profileStatus}
              counts={counts}
              onEdit={() => setProfileOpen(true)}
              onRetry={loadProfile}
            />
          </aside>
        </div>
      </main>

      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onDelete={bulkDelete}
          onStatus={bulkStatus}
          onClear={() => setSelected(new Set())}
        />
      )}

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        onSave={saveProfile}
      />
    </div>
  )
}
