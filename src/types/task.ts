export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Assignee {
  id: number
  name: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  /** ISO date (YYYY-MM-DD) */
  deadline: string
  assigneeId: number
}

export type TaskPayload = Omit<Task, 'id'>

export interface TaskFilters {
  status: TaskStatus | ''
  search: string
  assigneeId: number | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Выполнена',
}

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as TaskStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))
