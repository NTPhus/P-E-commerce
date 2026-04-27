Phase 0 Plan (MVP Scaffolding)

- Scope: Catalog, Cart, Checkout domains; Planner/Orchestrator, Memory, Rules Engine skeleton; Agent interfaces for MVP (CatalogAgent, CartAgent, CheckoutAgent).
- Deliverables for Phase 0: design declarations, data contracts, memory schema skeleton, MVP rules, agent interface stubs, base CI/CD observability plan.
- Key decisions:
- - MVP domains fixed: Catalog, Cart, Checkout.
- - Rule-based only (no external AI services).
- - In-memory planning flow with event replay capability for recovery.
- - Simple payload contracts for Planner->Agent communication.
- - Minimal API/CLI surface to drive MVP workflows (no UI).

Notes:
- This document serves as the Phase 0 kickoff anchor. All Phase 0 decisions should be reflected in architecture/memory/rules docs and the Phase 1 backlog.
