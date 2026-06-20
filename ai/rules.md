# Coding Rules & Runtime Standards

These rules should reflect the repo as it exists today.

## 1. Naming
- Files: prefer existing repo conventions; do not rename broadly without reason.
- Variables/functions: `camelCase`
- Classes/types/interfaces: `PascalCase`
- Enums/constants: `UPPER_SNAKE_CASE` or enum members as already used

## 2. Repo Structure
- `/apps/web`: buyer + seller React/Vite UI
- `/apps/api`: NestJS commerce backend
- `/apps/admin`: admin React/Vite dashboard
- `/ai`: planning docs, memory, agent scaffolding

Do not assume `TurboRepo`, `packages/*`, or shared workspace packages exist unless they are actually added.

## 3. Backend Rules
- Controllers handle routing and auth boundaries.
- Services hold business rules and transaction logic.
- Prisma can be called directly from services in this MVP; introducing a repository layer is optional, not mandatory.
- Keep `/v1` route prefix intact.
- Prefer explicit business-rule errors over generic failures.

## 4. Frontend Rules
- Preserve the current lightweight React/Vite approach.
- Keep UI practical and role-aware.
- Avoid introducing heavy state libraries unless there is a clear need.
- Inline styles should be avoided when editing current screens; prefer CSS files already used by the repo.

## 5. API Conventions
- Use RESTful routing with `GET`, `POST`, `PATCH`, `DELETE`.
- Return raw objects when that matches existing modules; avoid introducing a second response convention inside the same app.
- Keep auth as bearer-token based JWT.

## 6. Current Business Rules To Preserve
- Cart is single-seller.
- Checkout is COD-only.
- Buyer can cancel only confirmed orders.
- Seller can only fulfill orders belonging entirely to that seller.
- Admin can manage categories and override order state.
- Media upload is restricted to seller/admin.

## 7. Testing
- API: Jest
- Web: Vitest
- Admin: add tests only when signal is worth the setup cost
- Prefer adding targeted tests around business rules and regressions
