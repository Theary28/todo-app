import { apiFetch } from '@/services/api'
import type { Status, Todo } from '@/types'

const API = '/todos'

// The backend uses "TODO" / "IN_PROGRESS" / "DONE"; the app shows "To Do" / "In Progress" / "Done"
const toApiStatus: Record<Status, string> = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  Done: 'DONE',
}

const fromApiStatus: Record<string, Status> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

// What the backend sends back for one todo
interface ApiTodo {
  id: number
  title: string
  status: string
  starred: boolean
}

// The backend uses number ids; the app uses strings
const toTodo = (data: ApiTodo): Todo => ({
  id: String(data.id),
  title: data.title,
  status: fromApiStatus[data.status] ?? 'To Do',
  starred: data.starred,
})

// Load the signed-in user's list
export async function getTodos(): Promise<Todo[]> {
  const res = await apiFetch(API)
  if (!res.ok) throw new Error('Could not load todos')
  const data: ApiTodo[] = await res.json()
  return data.map(toTodo)
}

// Add a to-do
export async function createTodo(title: string, status: Status, starred = false): Promise<Todo> {
  const res = await apiFetch(API, {
    method: 'POST',
    body: JSON.stringify({ title, status: toApiStatus[status], starred }),
  })
  if (!res.ok) throw new Error('Could not add todo')
  return toTodo(await res.json())
}

// Edit the title, status or star
export async function updateTodo(id: string, changes: Partial<Omit<Todo, 'id'>>): Promise<Todo> {
  const body = changes.status ? { ...changes, status: toApiStatus[changes.status] } : changes
  const res = await apiFetch(`${API}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Could not update todo')
  return toTodo(await res.json())
}

// Delete a to-do
export async function deleteTodo(id: string): Promise<void> {
  const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Could not delete todo')
}
