# System Architecture: Commerce Core MVP

## 1. Repo Structure
```text
.
├── apps
│   ├── web          # Buyer + Seller UI
│   ├── api          # NestJS commerce backend
│   └── admin        # Admin operations UI
├── ai               # Planning docs, memory, agent scaffolding
└── docker-compose.yml
```

Repo hiện chưa có `turbo.json` hay `packages/*` shared workspace như vision ban đầu.

## 2. Runtime Scope

### Implemented
- **Auth**: JWT login/register, roles `ADMIN`, `BUYER`, `SELLER`
- **Catalog**: Product list/detail, seller product CRUD, admin category CRUD
- **Cart**: Persistent cart theo buyer, rule `single-seller`
- **Checkout**: COD checkout, transactional order creation, stock decrement
- **Orders**:
  - Buyer: list/detail/cancel confirmed order
  - Seller: view own incoming orders, move `CONFIRMED -> SHIPPING -> COMPLETED`
  - Admin: full order oversight + status override
- **Media**: ImageKit upload/delete for seller/admin
- **Messaging**: In-memory chat/websocket scaffold

### Not Implemented Yet
- Social graph, feed, groups, likes/comments
- Short video commerce
- Recommendation engine
- Voucher/discount
- OAuth/Facebook login
- Affiliate workflows

## 3. Core Commerce Rules
- Cart chỉ chứa sản phẩm từ một seller tại một thời điểm.
- Checkout chỉ hỗ trợ COD.
- Checkout dùng transaction để tạo order, order items, trừ stock, và clear cart.
- Buyer chỉ được hủy order khi trạng thái đang là `CONFIRMED`.
- Seller chỉ được cập nhật fulfillment cho order hoàn toàn thuộc catalog của seller đó.
- Media upload chỉ mở cho `SELLER` và `ADMIN`.

## 4. Data Model Highlights
- `User(role)` với `ADMIN`, `BUYER`, `SELLER`
- `Category`
- `Product(status)` với `ACTIVE`, `ARCHIVED`
- `Cart`, `CartItem`
- `Order(status)` với `PENDING`, `CONFIRMED`, `SHIPPING`, `COMPLETED`, `CANCELLED`
- `OrderItem`

## 5. Verification Strategy
- API build bằng `nest build`
- API tests bằng Jest cho:
  - auth
  - cart seller isolation
  - checkout
  - order lifecycle
- Frontend build bằng Vite cho `web` và `admin`
- Frontend smoke test bằng Vitest cho `apps/web`
