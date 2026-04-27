import { describe, it, expect } from 'vitest'
import { createInitialWorld, replayWorldFromHistory } from '../memory/world'
import { TaskRecord } from '../memory/world'

describe('Memory replay basics (Phase 0)', () => {
  it('replays history to reconstruct task states', () => {
    const world = createInitialWorld()
    // seed a simple event history
    world.history.push({ timestamp: Date.now(), type: 'task_started', payload: { taskId: 'T0.1' } })
    world.history.push({ timestamp: Date.now(), type: 'task_completed', payload: { taskId: 'T0.1', result: { ok: true } } })
    const replayed = replayWorldFromHistory(world)
    const t = replayed.tasks['T0.1'] as TaskRecord | undefined
    expect(t).toBeTruthy()
    expect(t?.status).toBe('completed')
  })
})
