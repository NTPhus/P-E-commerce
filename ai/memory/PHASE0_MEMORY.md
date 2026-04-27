Phase 0 Memory Sketch

- World State stores tasks, agents, and a history of events.
- Example: WorldState { tasks: { 'T0.1': { id: 'T0.1', action: 'create_product', status: 'pending', dependencies: [], data: {} } }, agents: ['CatalogAgent','CartAgent','CheckoutAgent'], history: [] }
- Replay: replay history by applying events in order to reconstruct current world state.
