# Coding Rules & Production Standards

This file defines the strict development standards for the **P-E-commerce** platform. All AI agents and developers MUST follow these.

## 1. Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `user-profile.component.tsx`).
- **Variables/Functions**: `camelCase`.
- **Classes/Interfaces/Types**: `PascalCase`.
- **Constants/Enums**: `UPPER_SNAKE_CASE`.
- **Database Tables**: `snake_case` (Prisma handles mapping).

## 2. Monorepo Folder Structure
- `/apps/web`: React + Vite (Buyer/Social).
- `/apps/api`: NestJS (Core Backend).
- `/apps/admin`: React + Vite (Dashboard).
- `/packages/ui`: Shared Tailwind components.
- `/packages/schema`: Shared Zod schemas and Prisma client.
- `/packages/utils`: Common helper functions.

## 3. Backend Layering (NestJS)
- **Controller**: Purely for request handling (routing, validation via Zod).
- **Service**: Business logic (transaction handling, external API calls).
- **Repository**: Database abstraction (Prisma calls, complex queries).
- **DTO**: Request/Response structure validation (Zod + Class-validator).

## 4. Frontend Component Design
- **Atomic Design**: `atoms`, `molecules`, `organisms`, `templates`.
- **Logic**: Use custom hooks for all API calls and complex state logic.
- **Styling**: TailwindCSS ONLY. No inline styles. Blue theme as primary.
- **State**: `Zustand` for global state, `React Query` (TanStack) for server state.

## 5. API Conventions
- **Restful**: Proper use of GET, POST, PUT, DELETE, PATCH.
- **Versioning**: Prefix all routes with `/v1`.
- **Responses**: Consistent wrapper `{ success: boolean, data: any, message: string }`.
- **Error Handling**: Use global exception filters. Never return raw DB errors to client.

## 6. Performance & Optimization
- **N+1**: Always use Prisma `include` or `select` carefully. Use Batching if needed.
- **Pagination**: Compulsory for all list endpoints (Cursor-based for Feed, Offset-based for Products).
- **Caching**: Cache recommendation scores and frequent social lookups.
- **Media**: All images/videos must go through Cloudinary with proper transformations.

## 7. Testing Strategy
- **Unit**: Vitest for business logic in Services/Utils.
- **Integration**: Testing Controller -> Service -> DB flow.
- **E2E**: Playwright for critical paths (Checkout, Signup).
