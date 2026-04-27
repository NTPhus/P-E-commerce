Phase 1 UI MVP Scaffold

- Summary: Phase 1 UI MVP scaffold: apps/web dashboard with mock data; admin dashboard with SVG charts; local admin chat; ready for QA. Build/test steps: npm install; npm run build; npm run dev. This PR isolates Phase 1 UI changes for safe QA.
- Included: apps/web (dashboard, mockPhase1Data.json), apps/admin (SVG charts), local chat mock, phase 0 scaffolding ready for QA.
- How to run:
  - Build: npm install; npm run build (apps/web)
  - Run: npm run dev (in apps/web)
  - Access: http://localhost:5173
- Tests/QA:
  - Build OK; UI loads mock data; charts render; chat mock works.
- Rollback/DoD:
  - Phase 1 UI changes isolated to phase1-ui-pr; rollback possible via PR revert.
- Next steps:
  - Wire Phase 1 UI to mock API endpoints (or real endpoints) when backend is ready.
  - Add charts with drill-downs and ensure SVG icons load lightweight assets.
  - Prepare for Phase 1 backend integration on dev/main.
