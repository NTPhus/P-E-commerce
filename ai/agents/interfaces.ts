// TypeScript interfaces for MVP Agent contracts (Phase 0)
export interface AgentInput {
  taskId: string
  action: string
  data?: any
}

export interface AgentOutput {
  success: boolean
  result?: any
  error?: string
}
