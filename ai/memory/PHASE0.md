Phase 0: Architectural & Planning Decisions

- Scope: MVP planning scaffolding for Catalog, Cart, Checkout domains; Planner/Memory/Rules Engine; Agent interfaces (CatalogAgent, CartAgent, CheckoutAgent).
- Key decisions:
- 1) Architecture: phase 0 gets a fully documented planning scaffolding, not a full integration repo.
- 2) Rule-based recommender: no external AI; use simple rule engine with deterministic scoring.
- 3) Communication: plan to define Payload contracts between Planner and Agents; in Phase 0 keep in-memory/event-driven contracts.
- 4) Memory: skeleton world state and event log with basic replay capability.
- 5) MVP surface: API/CLI surface only for driving MVP tasks; no UI in Phase 0.
- 6) Observability: baseline logging, metrics for throughput and latency.

- Deliverables: Phase 0 decision log stored here; references to architecture.md and memory/schema in future phases.
