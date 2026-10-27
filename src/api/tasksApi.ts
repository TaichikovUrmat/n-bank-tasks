import type { Assignee, Paginated, Task, TaskFilters, TaskPayload, TaskStatus } from '@/types/task'

/**
 * Мок REST API. Данные хранятся в localStorage, поэтому переживают перезагрузку.
 * Контракт (фильтрация и пагинация на «сервере») повторяет реальный бэкенд,
 * поэтому замена на настоящий API потребует правок только в этом файле.
 */

const STORAGE_KEY = 'n-bank:tasks:v1'
const LATENCY_MS = 250

export const ASSIGNEES: Assignee[] = [
  { id: 1, name: 'Айбек Тоқтаров' },
  { id: 2, name: 'Мария Иванова' },
  { id: 3, name: 'Данияр Сыдыков' },
  { id: 4, name: 'Елена Петрова' },
  { id: 5, name: 'Эрлан Асанов' },
]

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

function seed(): Task[] {
  const titles = [
    'Настроить CI/CD пайплайн',
    'Обновить дизайн личного кабинета',
    'Исправить баг с валидацией IBAN',
    'Написать документацию по API',
    'Провести ревью PR по платежам',
    'Оптимизировать загрузку списка транзакций',
    'Добавить 2FA при входе',
    'Подготовить релиз 2.4',
    'Миграция на новую версию SDK',
    'Покрыть тестами модуль переводов',
  ]
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']
  const base = new Date()
  base.setHours(0, 0, 0, 0)

  return Array.from({ length: 47 }, (_, i) => {
    const deadline = new Date(base)
    deadline.setDate(base.getDate() + ((i * 5) % 40) - 10)
    return {
      id: i + 1,
      title: `${titles[i % titles.length]} #${i + 1}`,
      description: `Описание задачи №${i + 1}. Подробности уточнить у ответственного.`,
      status: statuses[(i * 7) % 3],
      deadline: deadline.toISOString().slice(0, 10),
      assigneeId: ASSIGNEES[i % ASSIGNEES.length].id,
    }
  })
}

function load(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Task[]
  } catch {
    // повреждённые данные или недоступный storage — начинаем с seed
  }
  const initial = seed()
  persist(initial)
  return initial
}

function persist(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // storage недоступен — работаем только в памяти
  }
}

let db: Task[] = load()

export async function fetchTasks(
  filters: TaskFilters,
  page: number,
  pageSize: number,
): Promise<Paginated<Task>> {
  const search = filters.search.trim().toLowerCase()

  const filtered = db
    .filter((t) => !filters.status || t.status === filters.status)
    .filter((t) => filters.assigneeId === null || t.assigneeId === filters.assigneeId)
    .filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search),
    )
    .sort((a, b) => b.id - a.id)

  const start = (page - 1) * pageSize
  return delay({
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  })
}

export async function fetchTask(id: number): Promise<Task> {
  const task = db.find((t) => t.id === id)
  if (!task) throw new Error('Задача не найдена')
  return delay({ ...task })
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const id = db.reduce((max, t) => Math.max(max, t.id), 0) + 1
  const task: Task = { id, ...payload }
  db = [...db, task]
  persist(db)
  return delay({ ...task })
}

export async function updateTask(id: number, payload: TaskPayload): Promise<Task> {
  const index = db.findIndex((t) => t.id === id)
  if (index === -1) throw new Error('Задача не найдена')
  const task: Task = { id, ...payload }
  db = db.map((t) => (t.id === id ? task : t))
  persist(db)
  return delay({ ...task })
}

export async function deleteTask(id: number): Promise<void> {
  db = db.filter((t) => t.id !== id)
  persist(db)
  await delay(undefined)
}
