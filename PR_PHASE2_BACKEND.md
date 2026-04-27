## Summary
Phase 2 Backend MVP Implementation: JWT/Passport authentication, RBAC guards, Cart/Checkout integration, and Prisma schema.

## Key Features
- **Authentication**: JWT-based auth with 24h token expiry, register/login endpoints
- **RBAC**: Role-based guards with @Public() decorator for auth bypass
- **Cart Module**: Add/remove items, calculate totals, validate stock
- **Checkout**: Order creation, mock payment processing (90% success), auto-cart clearing
- **Prisma**: Complete schema with User, Product, Cart, Order entities
- **Testing**: JWT validation, RBAC guards, Cart/Checkout integration tests
- **CI/CD**: Phase 2 backend test automation workflow

## Changes
### Core Auth
- JWT strategy with Bearer token extraction
- AuthService: register, login, validateUser
- RBAC guards with @Public() decorator
- Global guard via APP_GUARD

### Cart Module
- CartService: add, remove, clear, total calculation
- Product price mock (prod-1: $29.99, prod-2: $49.99, prod-3: $99.99)
- CartController with @Roles('user', 'admin') protection

### Checkout Module
- CheckoutService: full order lifecycle
  - startCheckout: create order from cart
  - processPayment: mock 90% success rate
  - getOrder, getUserOrders, completeOrder
- CartService injection for order creation
- Auto-cart clearing after payment

### Database
- User: username, email, password, role
- Product: name, description, price, stock
- Cart/CartItem: one-to-one user cart, many-to-many items
- Order/OrderItem: order tracking with status lifecycle

### Tests
- auth.jwt.test.ts: JWT lifecycle, register, login, validation
- cart-checkout.integration.test.ts: full checkout flow, multi-user, error cases
- rbac.guard.test.ts: public routes, role access, header fallback

## Deployment
- Environment variables: DATABASE_URL, JWT_SECRET (see .env.example)
- Phase 2 CI workflow: lint, test, build, prisma validation
- Ready for Prisma migration setup

## Related Issues
- Phase 0 skeleton complete ✅
- Phase 1 UI MVP complete ✅
- Phase 2 backend MVP (this PR)

## Testing
All tests pass locally:
- JWT token generation and validation
- RBAC role enforcement
- Cart/Checkout integration
- Multi-user order tracking

Can merge to dev after CI passes.
