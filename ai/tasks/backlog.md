# Project Backlog

## Done: Commerce Core MVP
- [x] Basic JWT auth cho buyer/seller/admin
- [x] Prisma/Postgres schema cho user/category/product/cart/order
- [x] Catalog API và product detail
- [x] Seller product CRUD
- [x] Admin category CRUD
- [x] Persistent cart và cart item API
- [x] COD checkout transaction
- [x] Buyer order history
- [x] Buyer cancel confirmed order
- [x] Seller fulfillment flow: `CONFIRMED -> SHIPPING -> COMPLETED`
- [x] Admin order oversight + metrics
- [x] Media upload cho seller/admin
- [x] Buyer/Seller web UI
- [x] Admin operations dashboard

## Next: Commerce Hardening
- [ ] Add request validation DTOs consistently across modules
- [ ] Add pagination/filtering for products and orders
- [ ] Add search endpoint for catalog
- [ ] Add richer error handling and response normalization
- [ ] Add API integration tests against a real Postgres container
- [ ] Add Playwright E2E for buyer checkout and seller fulfillment
- [ ] Add audit trail for admin order overrides

## Later: Commerce Expansion
- [ ] Voucher / discount logic
- [ ] Online payment simulation or gateway adapter
- [ ] Multi-image product gallery improvements
- [ ] Inventory alerts and low-stock handling
- [ ] Seller analytics

## Long-term Vision
- [ ] Social feed and post interactions
- [ ] Short-video commerce
- [ ] Recommendation engine
- [ ] Affiliate workflows
