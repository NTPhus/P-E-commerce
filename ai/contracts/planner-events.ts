// Phase 0: Planner-Agents event contracts (TypeScript)
export interface TaskInput {
  taskId: string
  action: string
  data?: any
}

export interface TaskOutput {
  taskId: string
  success: boolean
  result?: any
  error?: string
}

export type PlannerPayload = TaskInput
export type AgentPayload = TaskInput

// Extended contracts for richer events
export interface PlannerEvent {
  timestamp?: number
  payload: PlannerPayload
}

export interface AgentEvent {
  timestamp?: number
  payload: AgentPayload
  outcome?: TaskOutput
}
