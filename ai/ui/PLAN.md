UI Plan (Phase 1 MVP)

- Goal: Provide a lightweight frontend dashboard to visualize MVP planner lifecycle, memory state, and agent status.
- Tech alignment: Keep to the repo's stack (React + Vite, Tailwind) once we bootstrap apps/web. For Phase 0, we keep UI as a README/plan with mock data.
- Scope for Phase 1 MVP UI:
- 1) Dashboard with panels:
-    - Tasks in progress and history (live-ish via mocked data or API).
-    - World state snapshot: Catalog products, current cart state, ongoing orders.
-    - Agent status: which agent is handling which task, success rate.
- 2) Minimal navigation to drill into a single task or flow (catalog/cart/checkout).
- 3) Lightweight UI state management (Zustand) and server state (React Query).
- Data flow: Phase 1 will connect to NestJS API (/v1) or to a mock API during UI bootstrap.

- Deliverables:
-  - Design notes and component API surface in this PLAN.md (to be implemented in apps/web later).
-  - Optional prototype components in a future patch when bootstrap of apps/web is ready.
