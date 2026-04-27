// Phase 0 memory world state definitions (skeleton)
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskRecord {
  id: string
  title?: string
  action: string
  status: TaskStatus
  dependencies: string[]
  data?: any
  result?: any
}

export interface EventLogEntry {
  timestamp: number
  type: string
  payload?: any
}

export interface CatalogState {
  products: Product[]
}

export interface WorldState {
  tasks: Record<string, TaskRecord>
  agents: string[]
  history: EventLogEntry[]
  catalog?: CatalogState
}

export function createInitialWorld(): WorldState {
  return {
    tasks: {},
    agents: ['CatalogAgent', 'CartAgent', 'CheckoutAgent'],
    history: [],
    catalog: { products: [] }
  }
}

// Simple replay utility to reconstruct world state from event history
export function replayWorldFromHistory(state: WorldState): WorldState {
  // Start from a shallow clone to avoid mutating input state unexpectedly
  const working = { ...state, tasks: { ...state.tasks }, history: [ ...state.history ] }
  for (const ev of working.history) {
    try {
      const payload: any = ev.payload || {}
      switch (ev.type) {
        case 'task_started': {
          const t = working.tasks[payload.taskId]
          if (t) t.status = 'in_progress'
          break
        }
        case 'task_completed': {
          const t = working.tasks[payload.taskId]
          if (t) {
            t.status = 'completed'
            t.result = payload.result
          }
          break
        }
        case 'task_executed': {
          const t = working.tasks[payload.taskId]
          // If specific result available, mark completed
          if (t) {
            t.status = 'completed'
            t.result = payload.result
          }
          break
        }
        default:
          // unknown event; ignore
          break
      }
    } catch {
      // ignore faulty event payloads in replay to keep drain running
    }
  }
  return working
}
