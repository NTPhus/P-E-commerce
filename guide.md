# Test Guide for Phase 1 UI MVP

This guide describes how to run and verify tests related to Phase 1 UI MVP scaffold (Phase 1 UI PR: phase1-ui-pr).

What to test
- Unit tests: core business logic and services (ChatService MVP, Planner, Rules Engine mocks).
- API tests: backend MVP endpoints stubs for Phase 1 chat and metrics.
- UI smoke tests: homepage/dashboard rendering, panels, and local chat mock (Playwright e2e).
- CI: ensure PR checks pass (lint, unit tests, UI tests).

Prerequisites
- Node.js and npm installed.
- (Optional) GH CLI installed and authenticated if you want to run PR commands from CI or local runner.
- Playwright browsers installed for UI end-to-end tests.

1) Run unit tests (Vitest)
```
npx vitest run
```
This runs all Vitest tests, including those added for ChatService MVP.

2) Run API tests (server-side MVP)
- Install deps if not yet: `npm i` at repo root.
- Run: `npx vitest run apps/api/test/chat.service.test.ts` (or run all tests under apps/api/test).

3) Run UI end-to-end tests (Playwright)
- Install Playwright browsers (first run):
  `npx playwright install`
- Run UI e2e tests:
  `npm run test:e2e`  // requires Playwright config and spec files in apps/web/tests/e2e/

4) Local UI smoke test (manual)
- Build and run UI:
  - cd apps/web
  - npm install
  - npm run build
  - npm run dev
- Open http://localhost:5173 and verify: header, 3 panels (Tasks, Catalog, Agents) render and mock data loads; Admin Chat panel loads and accepts messages.

5) Notes
- All Phase 1 tests rely on mock data; backend integration will replace mocks in a later phase.
- For rollback, revert the PR or reset the merged branch to a previous commit.

End of guide.
