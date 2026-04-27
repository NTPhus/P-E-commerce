# Project Backlog: Unified Commerce & Social Platform (Granular)

## Phase 1: Infrastructure & Core Setup
- [ ] T1.1: Initialize TurboRepo monorepo workspace.
- [ ] T1.2: Setup `apps/api` (NestJS) boilerplate.
- [ ] T1.3: Setup `apps/web` (React + Vite) boilerplate.
- [ ] T1.4: Setup `packages/schema` with Prisma and initial `schema.prisma`.
- [ ] T1.5: Setup `packages/ui` with TailwindCSS and shared Blue theme.
- [ ] T1.6: Setup `packages/config` for shared TSConfig, ESLint, and Prettier.
- [ ] T1.7: Configure `turbo.json` for build/dev pipelines.
- [ ] T1.8: Setup Docker Compose for local PostgreSQL and Redis.

## Phase 0: MVP Planning & Scaffolding
- [ ] T0.1: Định danh MVP domains
- [ ] T0.2: Thiết kế dữ liệu tối thiểu cho MVP
- [ ] T0.3: Định nghĩa API/events cho Planner và Agents
- [ ] T0.4: Thiết kế quy trình kiểm thử MVP
- [ ] T0.5: Memory schema sơ khởi
- [ ] T0.6: Task model và lifecycle
- [ ] T0.7: Rules Engine MVP sơ khởi
- [ ] T0.8: Agent interface và stubs MVP
- [ ] T0.9: CI/CD baseline và observability
- [ ] T0.10: Tài liệu arch/ memory/ rules
 - [ ] T0.11: Demo Phase 0 runner (demo-phase0.ts) and run instructions

## Phase 2: Authentication & User System
- [ ] T2.1: Implement User entity and migrations in Prisma.
- [ ] T2.2: Build NestJS Auth Module (JWT Strategy, Passport).
- [ ] T2.3: Implement Register/Login API with Bcrypt hashing.
- [ ] T2.4: Implement Facebook OAuth2 integration (Passport-Facebook).
- [ ] T2.5: Build RBAC Guards and Decorators (Roles: Admin, Buyer, Seller, Affiliate).
- [ ] T2.6: Setup Frontend Auth store (Zustand) and API interceptors.
- [ ] T2.7: Build Login/Register UI pages with Tailwind.

## Phase 3: Product & Category Management
- [ ] T3.1: Implement Category CRUD API with NestJS.
- [ ] T3.2: Implement Product CRUD API (Seller role protected).
- [ ] T3.3: Setup GIN indexes in PostgreSQL for Product Search.
- [ ] T3.4: Build Product Listing UI with Infinite Scroll.
- [ ] T3.5: Build Product Detail page with Image Gallery.
- [ ] T3.6: Build Category navigation and filters (Price, Rating).

## Phase 4: Social Graph & Features
- [ ] T4.1: Implement Follow/Unfollow API and Social Graph logic.
- [ ] T4.2: Build Social Feed API (Aggregation of followed users' posts).
- [ ] T4.3: Implement Post creation API (Support Text, Image, Video).
- [ ] T4.4: Build Like/Comment API with real-time optimistic updates.
- [ ] T4.5: Implement Group system (Create, Join, Post in Groups).

## Phase 5: Video Commerce & Recommendations
- [ ] T5.1: Build Short Video Feed UI (TikTok-style infinite scroll).
- [ ] T5.2: Implement Autoplay and Preloading logic for videos.
- [ ] T5.3: Build Product Tagging feature (Link Product to Video).
- [ ] T5.4: Implement Interaction Logging (View, Like, Comment) for Scoring.
- [ ] T5.5: Implement Rule-based Recommendation Service (Affinity + Decay).

## Phase 6: E-commerce & Checkout
- [ ] T6.1: Build Shopping Cart logic (Local storage + Sync to DB).
- [ ] T6.2: Implement Order & OrderItem API with transaction safety.
- [ ] T6.3: Build Checkout flow (Address, Payment selection, Summary).
- [ ] T6.4: Implement Voucher/Discount application logic.
- [ ] T6.5: Build Order Tracking UI for Buyers.

## Phase 7: Admin, Media & Optimization
- [ ] T7.1: Build Admin Dashboard (Stat overview, User/Product management).
- [ ] T7.2: Integrate Cloudinary SDK for media upload/transformation.
- [ ] T7.3: Implement Redis caching for Social Feed.
- [ ] T7.4: Final performance audit and index optimization.
- [ ] T7.5: Setup E2E Testing with Playwright for Checkout path.
