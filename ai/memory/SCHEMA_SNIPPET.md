Memory Schema Snippet (Phase 0)

- World State: { tasks: Record<string, TaskState>, agents: Record<string, any>, history: Array<Event> }
- TaskState: { id, status (pending|in_progress|completed|cancelled), payload, result }
- Event: { timestamp, type: string, payload: any }
- Recovery: replay history in order to reconstruct current world state.
