# Context Details

Context for agents and developers working in this repo.

## Current Product Scope
The repo currently delivers a `Commerce Core MVP`, not the full long-term unified commerce/social/video vision.

### Runtime domains that exist
- Auth
- Catalog
- Category management
- Cart
- Checkout
- Orders
- Seller operations
- Admin operations
- Media upload

### Vision domains that are not runtime yet
- Social graph and feed
- Video commerce
- Recommendation engine
- Affiliate workflows

## Constraints & Requirements
- **No External AI APIs**: recommendation/personalization should remain rule-based when implemented.
- **Tech Stack in runtime**: React (Vite), NestJS, Prisma, PostgreSQL, ImageKit.
- **Architecture**: modular app structure, with pragmatic direct Prisma usage in services for MVP.
- **Roles in runtime**: `ADMIN`, `BUYER`, `SELLER`.
- **Business rule**: cart is currently single-seller to simplify fulfillment.
