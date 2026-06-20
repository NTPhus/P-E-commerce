# Architectural Decisions

## Decisions Log

### [2026-04-26] Vision Architecture
- **Decision**: Keep the long-term product vision as unified commerce + social + video.
- **Rationale**: This still guides future expansion even though runtime scope is currently smaller.

### [2026-06-17] Commerce Core First
- **Decision**: Narrow runtime delivery to `Commerce Core MVP` before building social/video modules.
- **Rationale**: Repo state showed commerce scaffold existed, while broader vision was still mostly documentation.

### [2026-06-17] Persistence And Auth Baseline
- **Decision**: Use Prisma + Postgres in `apps/api` and implement JWT auth directly.
- **Rationale**: It gives a stable foundation for catalog/cart/order flows without waiting on broader platform infrastructure.

### [2026-06-17] Single-Seller Cart Rule
- **Decision**: Restrict each cart to products from one seller only.
- **Rationale**: This keeps checkout and seller fulfillment simple and avoids multi-seller order complexity in MVP.

### [2026-06-17] COD-only Checkout
- **Decision**: Limit MVP payment flow to COD.
- **Rationale**: It unlocks end-to-end order creation without gateway integration risk.

### [2026-06-18] Admin And Fulfillment Extension
- **Decision**: Add `ADMIN` role, category operations, buyer cancellation, seller fulfillment, and admin order metrics before expanding scope.
- **Rationale**: This completes the operational loop around the commerce core and makes the repo internally coherent for demo and further hardening.
