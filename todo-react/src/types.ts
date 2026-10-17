export type Status = 'To Do' | 'In Progress' | 'Done'

export type StatusFilter = Status | 'All'

export interface Todo {
  id: string
  title: string
  status: Status
  starred: boolean
}

export interface Profile {
  username: string
  displayName: string
  email: string
}

export type StatusCounts = Record<StatusFilter, number>
