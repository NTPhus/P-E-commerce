# Context Details

Contextual information for AI agents to understand the project's domain and specific constraints.

## Domain: Unified Commerce & Social Platform
A large-scale platform combining:
- **E-commerce**: Shopee-like marketplace (Product, Order, Voucher, Shipping).
- **Social**: Facebook-like social graph (Feed, Groups, Likes, Comments, DM).
- **Video Commerce**: TikTok-like short video feed with integrated shopping.

## Constraints & Requirements
- **No External AI APIs**: All recommendation and personalization must be rule-based.
- **Tech Stack**: Monorepo (TurboRepo), React (Vite), NestJS, Prisma, PostgreSQL, Cloudinary.
- **Architecture**: Modular Clean Architecture, scalable for future microservices.
- **Roles**: Admin, Buyer, Seller, Affiliate.
- **Performance**: High performance, optimized media delivery, N+1 query prevention.
