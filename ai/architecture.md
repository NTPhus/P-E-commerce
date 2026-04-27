# System Architecture: E-commerce + Social + Video Platform

## 1. Monorepo Structure (TurboRepo)
```
.
├── apps
│   ├── web          # React (Vite) - Social Feed, Shop, Short Videos
│   ├── api          # NestJS - Core Backend Service
│   └── admin        # React (Vite) - Management Dashboard
├── packages
│   ├── ui           # Shared Tailwind Components (Blue Theme)
│   ├── schema       # Shared Zod + Prisma Types
│   ├── utils        # Shared Helpers (Auth, Formatting)
│   └── config       # Shared ESLint, TS, Tailwind Configs
├── docker-compose.yml
└── turbo.json
```

## 2. Backend Module Breakdown (NestJS)
- **Auth**: OAuth (Facebook), JWT, Role-based Access (Admin, Buyer, Seller, Affiliate).
- **User**: Profiles, Social Graph (Follows, Followers).
- **Social**: Feed Generation, Posts, Comments, Likes, Groups.
- **Messaging**: Real-time DMs (Socket.io ready).
- **Product**: Catalog, Search (Indexed), Category Management.
- **Order**: Cart, Checkout, Vouchers, Tracking.
- **Video**: Short video processing, Product anchoring.
- **Recommendation**: Rule-based scoring engine.
- **Media**: Cloudinary integration.

## 3. Recommendation Logic (Rule-Based)
**Scoring Formula:**
`Score = (V * 1) + (L * 5) + (C * 10) + (P * 50)`
- `V`: Views
- `L`: Likes
- `C`: Comments
- `P`: Purchases

**Personalization Algorithm:**
1. **Interaction Tracking**: Log user interactions in `UserInteraction` table.
2. **Category Affinity**: Calculate weights for each category based on interaction scores.
3. **Decay Factor**: Reduce weight of old interactions (e.g., `-10% per week`).
4. **Ranking**:
   - Fetch items from top 3 affinity categories.
   - Boost items with high global popularity (Purchases).
   - Filter out already purchased items.

## 4. Performance Strategy
- **Database**: 
  - GIN indexes for product search.
  - Covering indexes for Social Feed queries.
  - Prevent N+1 using Prisma's strict `select`.
- **Frontend**:
  - Image/Video Lazy Loading.
  - Cloudinary auto-format/auto-quality (`f_auto, q_auto`).
- **Caching**:
  - Redis for Social Feed caching.
  - In-memory cache for Vouchers and Categories.

## 5. Testing Strategy
- **Unit**: Business logic in `packages/utils` and NestJS `services`.
- **Integration**: Database flow using a test container.
- **E2E**: Playwright tests for `apps/web` (Happy path: Browse -> Add to Cart -> Checkout).
