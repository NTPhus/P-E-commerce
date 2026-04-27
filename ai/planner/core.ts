import { WorldState, TaskRecord } from '../memory/world'

type IncomingTask = { id: string; action: string; data?: any }

function assignAgent(action: string): string {
  switch (action) {
    case 'create_product':
      return 'CatalogAgent'
    case 'add_to_cart':
      return 'CartAgent'
    case 'checkout':
      return 'CheckoutAgent'
    default:
      return 'CatalogAgent'
  }
}

export function planTask(input: IncomingTask, state: WorldState): TaskRecord {
  const agent = assignAgent(input.action)
  const task: TaskRecord = {
    id: input.id,
    action: input.action,
    status: 'pending',
    dependencies: [],
    data: input.data
  }
  // Attach assigned agent in the task (not a field in interface, but we store in data for draft)
  ;(task as any).assignedAgent = agent
  // update world with planned task snapshot for visibility
  state.tasks[input.id] = task
  return task
}

// Simple function to simulate execution by invoking the corresponding Agent handler
export async function executePlanned(input: IncomingTask, state: WorldState, agentParsers: any): Promise<any> {
  const task = planTask(input, state)
  const agentName = (task as any).assignedAgent
  if (!agentParsers || !agentParsers[agentName]) {
    return { success: false, error: 'No agent handler found' }
  }
  // Call the agent handler with the task payload
  const handler = agentParsers[agentName]
  const payload = { taskId: task.id, action: input.action, data: input.data }
  const res = await handler(payload)
  // update state
  task.status = res?.success ? 'completed' : 'cancelled'
  state.tasks[task.id] = task
  state.history.push({ timestamp: Date.now(), type: 'task_executed', payload: { taskId: task.id, action: input.action, result: res } })
  return res
}

// Task lifecycle helpers (Phase 0 MVP)
export function startTask(state: WorldState, taskId: string) {
  const t = state.tasks[taskId]
  if (t) t.status = 'in_progress'
  state.tasks[taskId] = t!
  state.history.push({ timestamp: Date.now(), type: 'task_started', payload: { taskId } })
  return t
}

export function completeTask(state: WorldState, taskId: string, result?: any) {
  const t = state.tasks[taskId]
  if (t) {
    t.status = 'completed'
    t.result = result
  }
  state.tasks[taskId] = t!
  state.history.push({ timestamp: Date.now(), type: 'task_completed', payload: { taskId, result } })
  return t
}

export default {
  planTask,
  executePlanned
}
