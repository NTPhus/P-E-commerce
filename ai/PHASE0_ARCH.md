Phase 0 Architecture Plan (MVP Scaffold)

- Scope: Planner/Orchestrator, Memory world, Rules Engine skeleton, Agent interfaces with MVP stubs for Catalog, Cart, Checkout.
- Data contracts: TaskInput/TaskOutput; Payload contracts for Planner-Agents; minimal MVP data models (Product, Cart, Order, User, Inventory).
- Communication: In-process, task-based calls; later migrate to HTTP/gRPC if needed.
- Memory: WorldState with event log and replay capability; track task lifecycle and history.
- Rules Engine: Simple mapping rules for MVP: create_product -> CatalogAgent, add_to_cart -> CartAgent, checkout -> CheckoutAgent.
- Observability: Basic logging; observability will grow in Phase 1 with metrics on throughput/latency.
