Phase 0 Runbook (MVP Skeleton)

- Prerequisites: Node.js, npm, TypeScript tooling; optional ts-node for direct TS execution.
- Commands:
- 1) Install deps: npm install
- 2) Run Phase 0 demo: npx ts-node ai/demos/demo-phase0.ts
- 3) Inspect output: phase 0 results in console, world state and history updated in memory structures.
- Notes:
- This run uses in-process stubs for Agents; Phase 1 will move to real inter-service communication.
