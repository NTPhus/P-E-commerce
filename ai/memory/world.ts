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
